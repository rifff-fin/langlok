"""
Build the image layers for the hero's "living film" (client/public/film/).

Everything is generated: there are no photos in the film. The Chatak itself is drawn live in
code (client/src/film/chatak.ts), referenced from the client's pictures; these layers are the
world around it:

  wood-far.webp, wood-mid.webp   tileable bands of misty forest (trunks into canopy)
  wood-near.webp                 out-of-focus acacia fronds for the foreground (tileable)
  river-bank.webp                treelines over the river (the river scene)
  mist-a.webp, mist-b.webp       tileable horizontal mist (white, alpha)
  clouds-light.webp, clouds-storm.webp   tileable cloud banks (shaded, alpha)
  rays.webp                      soft light shafts (white, alpha)

All of it is seeded, so a rebuild reproduces the same files.

Run:  python scripts/build-film-layers.py      (Python 3.10+, Pillow, numpy, scipy)
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'client' / 'public' / 'film'


# ---------------------------------------------------------------- helpers

def smoothstep(e0: float, e1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def save_rgba(rgb: np.ndarray, alpha: np.ndarray, name: str, quality: int = 84) -> None:
    rgba = np.dstack([np.clip(rgb, 0, 255), np.clip(alpha * 255, 0, 255)]).astype(np.uint8)
    Image.fromarray(rgba).save(OUT / name, 'WEBP', quality=quality, alpha_quality=90, method=6)
    print(f'{name:22s} {rgba.shape[1]}x{rgba.shape[0]}  {(OUT / name).stat().st_size // 1024} KB')


# ---------------------------------------------------------------- the river

def river_bank() -> None:
    """A clean river valley in mist: three treelines of rounded canopy, each farther one
    paler and softer, their feet lost in rising mist. Transparent sky above; tileable
    left-right. The film mirrors it in the water."""
    h, w = 520, 2048
    rng = np.random.default_rng(12)
    x = np.arange(w)
    out = np.zeros((h, w, 3)) + np.array([236.0, 240.0, 242.0])  # mist, not black, behind edges
    alpha = np.zeros((h, w))
    yy = np.arange(h)[:, None]
    layers = [  # (top of canopy as a fraction of h, crown size px, colour, softness px)
        (0.30, 70, (172, 186, 182), 3.0),
        (0.46, 52, (126, 146, 134), 2.0),
        (0.62, 38, (88, 110, 94), 1.2),
    ]
    for i, (top, crown, col, soft) in enumerate(layers):
        prof = np.zeros(w)
        for k, amp in ((w / (crown * 6), 26), (w / crown, 14), (w / (crown * 0.45), 5)):
            n = int(max(2, round(k)))
            ph = rng.uniform(0, 2 * np.pi, n)
            am = rng.uniform(0.3, 1.0, n) * amp / np.sqrt(n / 4)
            for j in range(n):
                prof += am[j] * np.sin(2 * np.pi * (j + 1) * x / w + ph[j]) / (j + 1) ** 0.6
        # rounded crowns: the max of bumps reads as tree tops (wrapped, so the band tiles)
        wrap = lambda d: (d + w / 2) % w - w / 2  # noqa: E731
        bumps = np.maximum.reduce([
            np.cos(np.clip(wrap(x - c) / (crown * rng.uniform(0.4, 0.7)), -np.pi / 2, np.pi / 2)) ** 0.6
            * rng.uniform(10, 26)
            for c in rng.uniform(0, w, int(w / crown * 1.6))
        ])
        line = top * h - prof - bumps
        cover = smoothstep(-soft, soft, yy - line[None, :])
        # mist rising off the river: each layer fades towards its base
        base = top * h + 0.22 * h
        fog = smoothstep(top * h, base + 40, yy)
        mist_col = np.array([236.0, 240.0, 242.0])
        c = np.array(col, float)[None, None, :] * (1 - 0.75 * fog[..., None]) + mist_col * 0.75 * fog[..., None]
        out = out * (1 - cover[..., None]) + c * cover[..., None]
        alpha = alpha * (1 - cover) + cover
    out = ndi.gaussian_filter(out, (0.8, 0.8, 0), mode='wrap')
    save_rgba(out, alpha, 'river-bank.webp', 82)


# ---------------------------------------------------------------- the forest

def woods(name: str, seed: int, *, trunks: int, width: tuple[float, float],
          trunk: tuple[int, int, int], canopy: tuple[int, int, int], cover: float,
          mist_from: float, blur: float, h: int = 900, w: int = 2048) -> None:
    """A tileable band of misty forest: trunks rising out of the mist into a canopy."""
    rng = np.random.default_rng(seed)
    S = 2  # drawn at 2x, then reduced (antialiasing)
    W, H = w * S, h * S
    img = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(img)
    for _ in range(trunks):
        x = rng.uniform(0, W)
        wd = rng.uniform(*width) * S
        lean = rng.uniform(-0.035, 0.035)
        wob = rng.uniform(0, 6.28)
        ys = np.linspace(-0.05 * H, H, 28)
        cx = x + lean * ys + 5 * S * np.sin(ys / H * 4 + wob)
        ww = wd * (0.7 + 0.45 * ys / H)  # wider towards the ground
        poly = list(zip(cx - ww / 2, ys)) + list(zip((cx + ww / 2)[::-1], ys[::-1]))
        limbs = []
        for _ in range(int(rng.integers(0, 3))):  # limbs curving up into the canopy
            yb = rng.uniform(0.05, 0.36) * H
            side = 1 if rng.uniform() < 0.5 else -1
            length = rng.uniform(0.07, 0.16) * H
            ang = rng.uniform(0.5, 1.0)  # from vertical at the trunk
            x0 = float(np.interp(yb, ys, cx))
            t = np.linspace(0, 1, 12)
            a = ang * (1 - 0.55 * t)  # bends upward along its length
            lx = x0 + side * np.cumsum(np.sin(a)) * length / 12
            ly = yb - np.cumsum(np.cos(a)) * length / 12
            bw = wd * 0.28 * (1 - 0.85 * t)  # tapers to a point
            left = list(zip(lx - bw / 2 * np.cos(a), ly - bw / 2 * np.sin(a) * side))
            right = list(zip(lx + bw / 2 * np.cos(a), ly + bw / 2 * np.sin(a) * side))
            limbs.append(left + right[::-1])
        for off in (-W, 0, W):  # wrap, so the band tiles
            d.polygon([(px + off, py) for px, py in poly], fill=255)
            for limb in limbs:
                d.polygon([(px + off, py) for px, py in limb], fill=255)
    bark = np.asarray(img.resize((w, h), Image.LANCZOS)).astype(np.float64) / 255
    # canopy: billows hanging from the top, ragged at the lower edge
    n = fractal(h, w, 3.5, 1.0, low=0.004, seed=seed + 5)
    n = ndi.gaussian_filter(n, 2.5, mode='wrap') + 0.12 * fractal(h, w, 2.4, 1.0, seed=seed + 6)
    y = np.linspace(0, 1, h)[:, None]
    leaf = smoothstep(cover, cover + 0.55, n - 4.0 * y)
    alpha = np.maximum(bark, leaf)
    k = (leaf / np.maximum(alpha, 1e-6))[..., None]  # how much of a pixel is canopy
    col = np.array(trunk, float) * (1 - k) + np.array(canopy, float) * k
    alpha = alpha * (1 - smoothstep(mist_from, 1.0, y))  # the floor dissolves into mist
    alpha = ndi.gaussian_filter(alpha, blur, mode=['nearest', 'wrap'])
    col = ndi.gaussian_filter(col, (blur, blur, 0), mode=['nearest', 'wrap', 'nearest'])
    save_rgba(col, alpha, name, 78)


def frond(d: ImageDraw.ImageDraw, x: float, y: float, ang: float, length: float, leaf: float,
          pairs: int, droop: float) -> None:
    """A pinnate acacia frond: a curving rachis with pairs of small leaflets."""
    for i in range(pairs):
        t = (i + 0.6) / pairs
        a = ang + droop * t
        px = x + np.cos(ang) * length * t + np.cos(a) * length * 0.05 * t
        py = y + np.sin(ang) * length * t + np.sin(a) * length * 0.05 * t + droop * length * 0.3 * t * t
        size = leaf * (1.0 - 0.45 * t)
        for side in (-1, 1):
            la = a + side * 1.0  # leaflets angle forward from the rachis
            cx = px + np.cos(la) * size * 0.9
            cy = py + np.sin(la) * size * 0.9
            pts = []
            for k in range(12):
                th = 2 * np.pi * k / 12
                ex, ey = np.cos(th) * size, np.sin(th) * size * 0.36
                pts.append((cx + ex * np.cos(la) - ey * np.sin(la), cy + ex * np.sin(la) + ey * np.cos(la)))
            d.polygon(pts, fill=255)
    tip_x = x + np.cos(ang) * length
    tip_y = y + np.sin(ang) * length + droop * length * 0.3
    d.line([(x, y), (tip_x, tip_y)], fill=255, width=max(2, int(leaf * 0.18)))


def wood_near() -> None:
    """Large, soft acacia fronds very close to the lens: dark, out of focus, tileable."""
    h, w = 560, 2048
    S = 2
    rng = np.random.default_rng(91)
    img = Image.new('L', (w * S, h * S), 0)
    d = ImageDraw.Draw(img)
    for cx in (0.04, 0.2, 0.31, 0.62, 0.8, 0.94):
        for _ in range(3):
            x = (cx + rng.uniform(-0.03, 0.03)) * w * S
            y = h * S * rng.uniform(0.95, 1.1)
            ang = -np.pi / 2 + rng.uniform(-0.9, 0.9)
            for off in (-w * S, 0, w * S):
                frond(d, x + off, y, ang, h * S * rng.uniform(0.45, 0.8), 30 * S * rng.uniform(0.8, 1.2),
                      int(rng.integers(8, 12)), rng.uniform(-0.3, 0.3))
    a = np.asarray(img.resize((w, h), Image.LANCZOS)).astype(np.float64) / 255
    a = ndi.gaussian_filter(a, 7, mode=['nearest', 'wrap']) * 0.9
    col = np.zeros((h, w, 3)) + np.array([58.0, 72.0, 64.0])
    save_rgba(col, a, 'wood-near.webp', 76)


# ---------------------------------------------------------------- atmosphere

def fractal(h: int, w: int, beta: float, stretch: float = 1.0, low: float = 0.0, seed: int = 0) -> np.ndarray:
    """Tileable fractal noise (1/f^beta spectrum, random phases). `stretch` > 1 widens the
    features horizontally; `low` removes the very largest blotches."""
    rng = np.random.default_rng(seed)
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.rfftfreq(w)[None, :] * stretch
    f = np.sqrt(fx * fx + fy * fy)
    f[0, 0] = 1
    amp = f ** (-beta / 2)
    if low:
        amp *= 1 - np.exp(-((f / low) ** 2))
    amp[0, 0] = 0
    spec = amp * np.exp(1j * rng.uniform(0, 2 * np.pi, amp.shape))
    n = np.fft.irfft2(spec, s=(h, w))
    return (n - n.mean()) / n.std()


def mist(name: str, seed: int, stretch: float, density: float) -> None:
    """A band of mist: tileable left-right, fading out at its top and bottom."""
    h, w = 384, 1024
    n = fractal(h, w, 3.4, stretch, low=0.003, seed=seed)
    n2 = fractal(h, w, 3.0, stretch * 0.7, seed=seed + 11)
    f = ndi.gaussian_filter(n + 0.4 * n2, 2.0, mode='wrap')
    d = smoothstep(-0.9 + density, 1.7, f)
    y = np.linspace(0, 1, h)[:, None]
    band = np.sin(np.pi * y) ** 1.1
    alpha = np.clip(d * band, 0, 1) * 0.85
    col = np.array([248.0, 249.0, 250.0]) - np.array([18.0, 13.0, 9.0]) * (d ** 2)[..., None]
    save_rgba(col, alpha, name, 72)


def clouds(name: str, seed: int, lit: tuple[int, int, int], shade: tuple[int, int, int],
           cover: float) -> None:
    """A tileable bank of billowing cloud, lit from above (smoky undersides)."""
    h, w = 576, 1536
    base = fractal(h, w, 3.2, 1.8, low=0.0015, seed=seed)
    wx = fractal(h, w, 3.0, 1.5, seed=seed + 1)
    wy = fractal(h, w, 3.0, 1.5, seed=seed + 2)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    warped = ndi.map_coordinates(base, [yy + 30 * wy, xx + 46 * wx], order=1, mode='wrap')
    d = warped + 0.35 * fractal(h, w, 2.6, 1.4, seed=seed + 3)
    y = np.linspace(0, 1, h)[:, None]
    d = d - 2.4 * (1 - np.sin(np.pi * y) ** 0.7)  # thin out towards the band edges
    density = ndi.gaussian_filter(smoothstep(cover, cover + 2.4, d), 3.0, mode='wrap')
    soft = ndi.gaussian_filter(density, 12, mode='wrap')
    light = soft - ndi.shift(soft, (-16, 0), mode='wrap')  # lit tops, shaded undersides
    k = np.clip(0.42 + 0.5 * density - 1.8 * light, 0, 1)[..., None]  # thicker = darker
    col = np.array(lit, float) * (1 - k) + np.array(shade, float) * k
    # the band must vanish at its top and bottom rows (it is drawn as a strip)
    window = smoothstep(0.0, 0.22, y) * smoothstep(0.0, 0.22, 1 - y)
    alpha = np.clip(density * 1.1, 0, 1) * window
    save_rgba(col, alpha, name, 72)


def rays() -> None:
    """Soft shafts of light falling from the upper right through the canopy."""
    n = 1024
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float64)
    sx, sy = n * 0.92, -n * 0.25  # the source, above the frame
    ang = np.arctan2(yy - sy, xx - sx)
    dist = np.hypot(yy - sy, xx - sx) / n
    stripes = np.zeros_like(ang)
    rng = np.random.default_rng(3)
    for _ in range(7):
        a0 = rng.uniform(1.9, 2.5)
        width = rng.uniform(0.02, 0.05)
        stripes += rng.uniform(0.35, 1.0) * np.exp(-(((ang - a0) / width) ** 2))
    fall = smoothstep(0.12, 0.6, dist) * (1 - smoothstep(0.8, 1.5, dist))
    alpha = np.clip(stripes * fall, 0, 1) * 0.5
    alpha = ndi.gaussian_filter(alpha, 10)
    col = np.zeros((n, n, 3)) + np.array([255.0, 246.0, 226.0])
    save_rgba(col, alpha, 'rays.webp', 80)


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    woods('wood-far.webp', 61, trunks=70, width=(5, 14), trunk=(194, 204, 201),
          canopy=(203, 212, 208), cover=-1.1, mist_from=0.34, blur=2.2)
    woods('wood-mid.webp', 73, trunks=16, width=(16, 34), trunk=(136, 151, 144),
          canopy=(146, 162, 153), cover=-0.85, mist_from=0.46, blur=1.0)
    wood_near()
    river_bank()
    mist('mist-a.webp', 21, stretch=3.2, density=0.0)
    mist('mist-b.webp', 34, stretch=2.2, density=0.35)
    clouds('clouds-light.webp', 51, lit=(252, 253, 253), shade=(214, 219, 226), cover=-0.9)
    # a cool, bruised slate: the monsoon has to meet the river's silver-green without a jump
    clouds('clouds-storm.webp', 77, lit=(224, 229, 233), shade=(112, 119, 133), cover=-1.2)
    rays()
