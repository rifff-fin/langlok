"""
The partners' cans and logos for "Who we serve" (client/public/img/partners/), from the client's
pictures in docs/client/partners/:
  <id>-can.png   a mockup of the partner's can on a plain backdrop -> cut out, stood upright (the
                 mockups are shot tilted; the can's long axis is found from its outline and
                 turned to vertical), its edges redrawn clean (see edge_alpha), trimmed,
                 900 px tall, WebP with alpha
  <id>-logo.png  the partner's logo on white -> margins trimmed, 640 px wide, WebP (the site shows
                 it on a white tile, so the white stays)

Needs rembg[cpu] (best in a throwaway venv; the model downloads on first use), Pillow, numpy.
    python scripts/build-partners.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs/client/partners'
OUT = ROOT / 'client/public/img/partners'
PARTNERS = ['six-seasons', 'gulf-toledo']
CAN_H = 900
LOGO_W = 640


def trim_alpha(im, pad=8):
    a = np.asarray(im.getchannel('A'))
    ys, xs = np.nonzero(a > 8)
    box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0),
           min(xs.max() + pad + 1, im.width), min(ys.max() + pad + 1, im.height))
    return im.crop(box)


def lean(mask):
    """The can's lean from vertical in degrees (its outline's principal axis)."""
    ys, xs = np.nonzero(mask)
    xs = xs - xs.mean()
    ys = ys - ys.mean()
    w, v = np.linalg.eigh(np.cov(np.vstack([xs, ys])))
    vx, vy = v[:, np.argmax(w)]
    if vy < 0:
        vx, vy = -vx, -vy
    return float(np.degrees(np.arctan2(vx, vy)))


def smooth(v, win=21, sigma=3.0):
    """A ragged edge profile made smooth: a running median (drops the matte's notches), then a
    small Gaussian."""
    half = win // 2
    padded = np.pad(v.astype(float), half, mode='edge')
    med = np.median(np.lib.stride_tricks.sliding_window_view(padded, win), axis=1)
    r = int(3 * sigma)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    return np.convolve(np.pad(med, r, mode='edge'), k / k.sum(), mode='valid')


def edge_alpha(mask, inset=1.5):
    """A clean, anti-aliased alpha for an upright can. The matte's outline is pixel-ragged, but a
    can is a simple shape: every row and every column crosses it in one span. So each row's left
    and right edges and each column's top and bottom are traced, smoothed, pulled in a little
    (off the backdrop's light fringe) and drawn back with sub-pixel coverage."""
    inside = mask > 0.5
    h, w = inside.shape

    def spans(m):
        idx = np.where(m.sum(1) > 3)[0]
        lo = np.argmax(m[idx], axis=1)
        hi = m.shape[1] - 1 - np.argmax(m[idx][:, ::-1], axis=1)
        return idx, smooth(lo) + inset, smooth(hi) + 1 - inset

    def coverage(m, n):
        idx, lo, hi = spans(m)
        c = np.arange(n) + 0.5
        cov = np.zeros(m.shape)
        cov[idx] = np.clip(c - lo[:, None], 0, 1) * np.clip(hi[:, None] - c, 0, 1)
        return cov

    return coverage(inside, w) * coverage(inside.T, h).T


def cut_upright(photo, session):
    """The can cut out of its photo, stood upright, with clean edges (RGBA) and its lean."""
    mask = remove(photo, session=session, only_mask=True)
    angle = lean(np.asarray(mask) > 128)
    turned = [(mask.rotate(sign * angle, resample=Image.BICUBIC, expand=True), sign)
              for sign in (1, -1)]
    mask, sign = min(turned, key=lambda t: abs(lean(np.asarray(t[0]) > 128)))
    # the photo turns with the backdrop's own colour filling the corners, so no dark fringe
    ground = tuple(int(c) for c in np.median(np.asarray(photo)[:8].reshape(-1, 3), axis=0))
    rgb = photo.rotate(sign * angle, resample=Image.BICUBIC, expand=True, fillcolor=ground)
    alpha = edge_alpha(np.asarray(mask, dtype=float) / 255)
    out = rgb.convert('RGBA')
    out.putalpha(Image.fromarray(np.round(alpha * 255).astype(np.uint8)))
    return out, angle


def trim_white(im, pad=24, tol=18):
    rgb = np.asarray(im.convert('RGB')).astype(int)
    ink = (255 - rgb).max(axis=2) > tol
    ys, xs = np.nonzero(ink)
    box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0),
           min(xs.max() + pad + 1, im.width), min(ys.max() + pad + 1, im.height))
    return im.convert('RGB').crop(box)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    session = new_session('isnet-general-use')
    for pid in PARTNERS:
        cut, angle = cut_upright(Image.open(SRC / f'{pid}-can.png').convert('RGB'), session)
        cut = trim_alpha(cut)
        w = round(cut.width * CAN_H / cut.height)
        cut.resize((w, CAN_H), Image.LANCZOS).save(OUT / f'{pid}-can.webp', quality=86, method=6)

        logo = trim_white(Image.open(SRC / f'{pid}-logo.png'))
        h = round(logo.height * LOGO_W / logo.width)
        logo.resize((LOGO_W, h), Image.LANCZOS).save(OUT / f'{pid}-logo.webp', quality=88, method=6)
        print(pid, f'can {w}x{CAN_H} (stood up {angle:+.1f} deg)', f'logo {LOGO_W}x{h}')


if __name__ == '__main__':
    main()
