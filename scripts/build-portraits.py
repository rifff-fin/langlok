"""
Build the leadership portraits (client/public/img/people/) from the client's photos
(docs/client/people/).

The two photos are very different (a white studio headshot, and an evening street with
neon light and a crowd), so each person is cut out, framed the same way (eyes at the same
height, the same face size), set on one grey studio backdrop and printed in black and white.
Faces and features are not retouched.

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

# Measured on the originals: the point between the eyes, and the chin.
PEOPLE = {
    'ceo': dict(src='ceo.jpg', eye=(452, 362), chin=652,
                model='isnet-general-use', matting=True),
    'managing-director': dict(src='managing-director.jpg', eye=(728, 795), chin=958,
                              model='u2net_human_seg', matting=False),
}

INK = np.array([18, 24, 33], float)
PAPER = np.array([244, 246, 247], float)


def cut_out(img: Image.Image, model: str, matting: bool, face: tuple[int, int]) -> Image.Image:
    """The person alone: the cut-out's region that holds the face (anyone behind is dropped)."""
    rgba = remove(img, session=new_session(model), alpha_matting=matting,
                  alpha_matting_foreground_threshold=240,
                  alpha_matting_background_threshold=12, alpha_matting_erode_size=8)
    a = np.asarray(rgba.getchannel('A'), float) / 255
    labels, _ = ndi.label(a > 0.35)
    keep = labels == labels[face[1], face[0]]
    # trim the rim a little, and repaint what is left of it with the nearest solid pixel's
    # colour: rim pixels still carry the old background (a dark halo on a light backdrop)
    keep = ndi.binary_erosion(keep, iterations=2)
    a = np.where(keep, a, 0)
    rgb = np.asarray(rgba.convert('RGB'))
    _, (iy, ix) = ndi.distance_transform_edt(~(a > 0.92), return_indices=True)
    clean = Image.fromarray(rgb[iy, ix].astype(np.uint8), 'RGB').convert('RGBA')
    clean.putalpha(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0)))
    return clean


def tone(lum: np.ndarray) -> np.ndarray:
    """Black and white with a gentle S-curve, printed in a cool ink-to-paper tone."""
    lum = np.clip(lum, 0, 1)
    lum = lum * lum * (3 - 2 * lum) * 0.35 + lum * 0.65
    return INK + (PAPER - INK) * lum[..., None]


def backdrop() -> np.ndarray:
    """A grey studio backdrop (the same for everyone): lighter behind the head."""
    y, x = np.mgrid[0:H, 0:W].astype(float)
    r = np.hypot((x - W * 0.5) / W, (y - EYE_Y * 0.95) / H)
    lum = (214 - 70 * np.clip(r / 0.85, 0, 1) ** 1.6 - 10 * (y / H)) / 255
    return tone(lum)


def person_in_bw(cut: Image.Image, eye: tuple[int, int], chin: int) -> Image.Image:
    """The cut-out in black and white, levelled so the skin below the eyes reads at one tone."""
    rgb = np.asarray(cut.convert('RGB'), float) / 255
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722])
    d = chin - eye[1]
    skin = lum[eye[1] + int(d * 0.3):eye[1] + int(d * 0.75), eye[0] - int(d * 0.35):eye[0] + int(d * 0.35)]
    lum = lum * (0.55 / max(1e-3, float(np.median(skin))))
    out = Image.fromarray(np.clip(tone(lum), 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
    out.putalpha(cut.getchannel('A'))
    return out


def frame(person: Image.Image, eye: tuple[int, int], chin: int) -> Image.Image:
    """Scale and place the person so the eyes and chin land on the shared marks."""
    k = EYE_TO_CHIN / (chin - eye[1])
    scaled = person.resize((round(person.width * k), round(person.height * k)), Image.LANCZOS)
    canvas = Image.fromarray(np.clip(backdrop(), 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    layer.paste(scaled, (round(W / 2 - eye[0] * k), round(EYE_Y - eye[1] * k)))
    canvas.alpha_composite(layer)
    rgb = np.asarray(canvas.convert('RGB'), float)
    grain = np.random.default_rng(7).normal(0, 2.2, (H, W, 1))  # a touch of film grain
    return Image.fromarray(np.clip(rgb + grain, 0, 255).astype(np.uint8), 'RGB')


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, p in PEOPLE.items():
        img = Image.open(SRC / p['src']).convert('RGB')
        cut = cut_out(img, p['model'], p['matting'], p['eye'])
        final = frame(person_in_bw(cut, p['eye'], p['chin']), p['eye'], p['chin'])
        path = OUT / f'{name}.webp'
        final.save(path, 'WEBP', quality=84, method=6)
        print(f'{path.relative_to(ROOT)}  {final.size}  {path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
