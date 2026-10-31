"""
Build the leadership portraits (client/public/img/people/) from the client's photos
(docs/client/people/).

Each person is cut out of the white studio background and framed the same way (eyes at the
same height, the same face size), in colour, on a transparent background: the section lays
them on its own olive backdrop and graphics (sections/Leadership.tsx), so the two photos read
as a pair. Brightness is matched on the skin; faces and features are not retouched.

Needs rembg (person cut-out; downloads its models on first use):
    pip install "rembg[cpu]"
Run:
    python scripts/build-portraits.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs' / 'client' / 'people'
OUT = ROOT / 'client' / 'public' / 'img' / 'people'

W, H = 720, 900  # 4:5
EYE_Y = 342  # where the eyes sit in the frame
EYE_TO_CHIN = 235  # the face size, the same for both
SKIN = 0.5  # the skin's median brightness both portraits are matched to (0..1)

# Measured on the originals (30 Oct 2026 photos): the point between the eyes, and the chin.
PEOPLE = {
    'ceo': dict(src='ceo.jpg', eye=(445, 363), chin=667),
    'managing-director': dict(src='managing-director.jpg', eye=(515, 472), chin=772),
}
MODEL = 'isnet-general-use'


def cut_out(img: Image.Image, face: tuple[int, int]) -> Image.Image:
    """The person alone: the cut-out's region that holds the face (anyone behind is dropped)."""
    rgba = remove(img, session=new_session(MODEL), alpha_matting=True,
                  alpha_matting_foreground_threshold=240,
                  alpha_matting_background_threshold=12, alpha_matting_erode_size=8)
    a = np.asarray(rgba.getchannel('A'), float) / 255
    labels, _ = ndi.label(a > 0.35)
    keep = labels == labels[face[1], face[0]]
    # trim the rim a little, and repaint what is left of it with the nearest solid pixel's
    # colour: rim pixels still carry the white studio background (a pale halo on olive)
    keep = ndi.binary_erosion(keep, iterations=2)
    a = np.where(keep, a, 0)
    rgb = np.asarray(rgba.convert('RGB'))
    _, (iy, ix) = ndi.distance_transform_edt(~(a > 0.92), return_indices=True)
    clean = Image.fromarray(rgb[iy, ix].astype(np.uint8), 'RGB').convert('RGBA')
    clean.putalpha(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0)))
    return clean


def match_skin(cut: Image.Image, eye: tuple[int, int], chin: int) -> Image.Image:
    """Scale the brightness (not the colour) so the skin below the eyes sits at SKIN."""
    rgb = np.asarray(cut.convert('RGB'), float) / 255
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722])
    d = chin - eye[1]
    skin = lum[eye[1] + int(d * 0.3):eye[1] + int(d * 0.75), eye[0] - int(d * 0.35):eye[0] + int(d * 0.35)]
    k = float(np.clip(SKIN / max(1e-3, float(np.median(skin))), 0.85, 1.2))
    out = Image.fromarray(np.clip(rgb * k * 255, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
    out.putalpha(cut.getchannel('A'))
    return out


def frame(person: Image.Image, eye: tuple[int, int], chin: int) -> Image.Image:
    """Scale and place the person so the eyes and chin land on the shared marks."""
    k = EYE_TO_CHIN / (chin - eye[1])
    scaled = person.resize((round(person.width * k), round(person.height * k)), Image.LANCZOS)
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    canvas.paste(scaled, (round(W / 2 - eye[0] * k), round(EYE_Y - eye[1] * k)))
    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, p in PEOPLE.items():
        img = Image.open(SRC / p['src']).convert('RGB')
        person = match_skin(cut_out(img, p['eye']), p['eye'], p['chin'])
        final = frame(person, p['eye'], p['chin'])
        path = OUT / f'{name}.webp'
        final.save(path, 'WEBP', quality=86, alpha_quality=90, method=6)
        print(f'{path.relative_to(ROOT)}  {final.size}  {path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
