#!/usr/bin/env python3
"""
Build the flat label textures for the 3D can and bottle from the client's mockup photos.

STOPGAP until the client supplies flat, unwrapped label artwork (TODO(client)): photos of
mockups are low resolution and carry baked-in lighting, so this script:

  1. estimates the bare metal behind the print per photo column (the mockups' reflections
     run in vertical stripes) and divides it out,
  2. keeps only the printed artwork inside hand-measured art boxes; droplets and reflections
     elsewhere become clean silver, which the 3D material then lights for real,
  3. maps the art onto the label in (arc length, height) space. Measured from glyph widths
     and baselines: the can front/back and bottle back art are flat overlays on the photos
     (x offset = arc length), the bottle front art is wrapped (asin, 6 deg camera elevation).
     The calibration below is in the mockups' own centimetres; the vessels have since been
     scaled to the supplier's sizes (vesselSpec.json `mockup`), so each label point is mapped
     back through that scale: one uniform factor (by height), so the artwork keeps its shape,
  4. builds the bottle's bird, wordmark and back panel from the cleaner can photos, scaled to
     the bottle layout (same artwork; the bottle photo's reflections are too strong to key);
     only bottle-specific text (SAY NO PLASTIC, comma; 990 ML ...) comes from bottle photos,
  5. writes a colour map (sRGB) and an ORM map (G = roughness, B = metalness: silver is bare
     metal, ink is matte) at 2048 and 1024 px wide, plus labelLayout.json (texture sizes and
     the bird/wordmark "logo zone" in UV space for the runtime YOUR LOGO HERE composer).

The back-label paragraph is deliberately left out: it carries absolute health claims
("leaches nothing", "zero microplastics") that the brief keeps off the site until the can
lining is confirmed. TODO(client): confirm wording, then supply flat label files.

Requires Python 3.10+, Pillow, numpy, scipy.
Usage:  python scripts/build-label-textures.py
Outputs (client/public/textures/):
  label-{can,bottle}.webp, label-{can,bottle}-orm.webp            2048 px wide
  label-{can,bottle}-1024.webp, label-{can,bottle}-orm-1024.webp  1024 px wide (phones)
"""
from __future__ import annotations

import json
import math
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import (binary_dilation, gaussian_filter, gaussian_filter1d,
                           map_coordinates, median_filter)

ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / 'client/public/img/mockups'
OUT = ROOT / 'client/public/textures'
SPEC = json.loads((ROOT / 'client/src/three/vesselSpec.json').read_text(encoding='utf-8'))
LAYOUT_OUT = ROOT / 'client/src/three/labelLayout.json'

SILVER = np.array([222.0, 225.0, 228.0])  # label background = 3D aluminium base colour (sRGB)
WIDTH = 2048
ROUGH_METAL, ROUGH_INK = 0.30, 0.55

# ---------------------------------------------------------------------------------------
# Photo calibration (pixels), measured from the mockups:
#   C, R      vessel axis x and body radius in the photo; pxcm = R / radius in cm
#   y_of_cm   photo row of the silhouette at a given height (cm)
#   mode      'flat' (art pasted flat: x offset = arc length) or 'wrapped' (true projection)
#   boxes     printed-art rectangles (x0, y0, x1, y1); everything else becomes clean silver
#   keep      soft threshold (deviation from metal) below which pixels count as background
# ---------------------------------------------------------------------------------------
CAN_PX = 151.5 / 3.2       # can front: 47.34 px/cm
CANB_PX = 231.0 / 3.2      # can back: 72.19 px/cm, aligned on the wall bottom (y 1385 = 0.99 cm)
BOT_PX = 164.0 / 3.8       # bottle front: 43.16 px/cm, base assumed at y 1190 (cropped photo)
BOTB_PX = 150.0 / 3.8      # bottle back: 39.47 px/cm, aligned on the shoulder end (y 300 = 20.62 cm)

CAN_LOGO_BOXES = ((280, 203, 307, 342),    # falling drop
                  (148, 343, 418, 566),    # Chatak
                  (148, 578, 427, 651),    # VERSA wordmark
                  (168, 644, 427, 703))    # water swash

CAN_FRONT = dict(
    file='can-front.jpeg', side='front', mode='flat', C=289.0, R=151.5, pxcm=CAN_PX,
    y_of_cm=lambda y: 957.0 - y * CAN_PX,
    boxes=((225, 128, 348, 164),           # SAY NO PLASTIC / SAVE THE WORLD
           *CAN_LOGO_BOXES,
           (158, 704, 412, 736),           # NATURAL DRINKING WATER
           (248, 739, 332, 771),           # pH 7.0
           (253, 870, 332, 899)))          # 500 ML

CAN_BACK = dict(
    file='can-back.jpeg', side='back', mode='flat', C=453.0, R=231.0, pxcm=CANB_PX,
    y_of_cm=lambda y: 1385.0 - (y - 0.99) * CANB_PX,
    boxes=((268, 313, 632, 345),           # CANS ARE AN INFINITELY
           (262, 348, 638, 494),           # RECYCLABLE ALTERNATIVE
           (288, 498, 617, 530),           # TO PLASTIC BOTTLES
           (408, 536, 497, 574),           # versa
           # paragraph (y 597-830) omitted on purpose, see module docstring
           (278, 871, 617, 907),           # This CAN makes a difference.
           (278, 973, 627, 1024),          # www.langlok.com
           (263, 1053, 452, 1362),         # barcode
           (493, 1088, 634, 1142),         # social icons
           (486, 1150, 639, 1302),         # QR
           (443, 1308, 677, 1362)))        # Manufactured in ...

BOTTLE_FRONT = dict(
    file='bottle-front.jpeg', side='front', mode='wrapped', C=438.0, R=164.0, pxcm=BOT_PX,
    elev=0.1036,                           # sin(6 deg), fitted from the NATURAL DRINKING WATER baseline
    keep=(0.08, 0.16),
    y_of_cm=lambda y: 1190.0 - y * BOT_PX,
    boxes=((343, 303, 533, 357),           # SAY NO PLASTIC, SAVE THE WORLD
           (303, 968, 577, 1005),          # NATURAL DRINKING WATER
           (403, 1041, 482, 1075),         # pH 7.0
           (398, 1118, 482, 1146)))        # 990 ML

BOTTLE_BACK = dict(
    file='bottle-back.jpeg', side='back', mode='flat', C=409.0, R=150.0, pxcm=BOTB_PX,
    keep=(0.08, 0.16),
    y_of_cm=lambda y: 300.0 + (20.62 - y) * BOTB_PX,
    boxes=((368, 996, 452, 1024),))        # 990 ML

# Label layers per vessel, composited in order. A transplant places art from another photo,
# scaled by k about matching anchors given as (arc offset cm, height cm) in source/destination.
# Anchors: VERSA wordmark centre (front) and RECYCLABLE centre (back), measured on each photo;
# k from the wordmark / headline widths (bottle art is the can art at ~1.34x front, ~1.22x back).
LAYERS = {
    'can': (
        dict(photo=CAN_FRONT, logo_boxes=CAN_LOGO_BOXES),
        dict(photo=CAN_BACK),
    ),
    'bottle': (
        dict(photo=BOTTLE_FRONT),
        dict(photo=BOTTLE_BACK),
        dict(photo=CAN_FRONT, boxes=CAN_LOGO_BOXES, logo_boxes=CAN_LOGO_BOXES,
             k=1.34, src=(-0.053, 7.224), dst=(0.10, 8.04)),
        dict(photo=CAN_BACK, k=1.22, src=(-0.048, 14.86), dst=(-0.05, 21.47)),
    ),
}


def wall_radius_fn(profile, y0, y1):
    """r(y) along the printable outer wall (the monotonic-in-height run covering y0..y1)."""
    pts = [(r, y) for r, y in profile]
    start = next(i for i, (_, y) in enumerate(pts) if y >= y0 - 0.3 and pts[i][0] > 0.5)
    run = [pts[start]]
    for r, y in pts[start + 1:]:
        if y <= run[-1][1]:
            break
        run.append((r, y))
    ys = np.array([y for _, y in run])
    rs = np.array([r for r, _ in run])
    assert ys[0] <= y0 and ys[-1] >= y1, 'profile must cover the label zone'
    return lambda y: np.interp(y, ys, rs)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def box_mask(shape, boxes):
    m = np.zeros(shape, bool)
    for bx0, by0, bx1, by1 in boxes:
        m[max(0, by0):by1, max(0, bx0):bx1] = True
    return m


@lru_cache(maxsize=None)
def prepare_photo(file, C, R, keep, boxes):
    """(normalised RGB, art alpha, ink alpha) in photo space for the given art boxes."""
    a = np.asarray(Image.open(PHOTOS / file).convert('RGB')).astype(np.float32)
    h, w, _ = a.shape
    box = box_mask((h, w), boxes)
    r0 = max(0, min(b[1] for b in boxes) - 40)
    r1 = min(h, max(b[3] for b in boxes) + 40)
    x0, x1 = max(0, int(C - 0.99 * R)), min(w, int(C + 0.99 * R))

    # 1. background = bare metal behind the print. Reflections on these mockups run in
    #    vertical stripes, so estimate it per column: de-speckle along the column, then
    #    interpolate straight down through each art box from the bare metal above and below.
    region = a[r0:r1, x0:x1]
    bare = ~box[r0:r1, x0:x1]
    smooth = median_filter(region, size=(9, 1, 1))
    ys = np.arange(region.shape[0])
    bg_reg = np.empty_like(region)
    for j in range(region.shape[1]):
        m = bare[:, j]
        for c in range(3):
            v = gaussian_filter1d(smooth[m, j, c], 3.0)
            bg_reg[:, j, c] = np.interp(ys, ys[m], v)
    bg = np.ones_like(a)
    bg[r0:r1, x0:x1] = gaussian_filter(bg_reg, sigma=(1.5, 1.0, 0))
    norm = np.clip(a / np.maximum(bg, 1.0) * SILVER, 0, 255)

    # 2. art masks inside the boxes. Colour keeps only pixels that clearly differ from the
    #    metal (soft threshold), so small background errors never show as patches.
    d = norm - SILVER
    dev = np.maximum((-d).max(axis=2), 1.8 * d.max(axis=2)) / 255.0  # white ink counts more
    near_art = binary_dilation((dev > 0.07) & box, iterations=3) & box
    a_art = gaussian_filter((smoothstep(*keep, dev) * near_art).astype(np.float32), 0.5)
    a_ink = gaussian_filter((smoothstep(0.06, 0.24, dev) * box).astype(np.float32), 0.6)
    return norm, np.clip(a_art, 0, 1), a_ink


def build(vessel: str):
    spec = SPEC[vessel]
    y0, y1 = spec['label']['y0'], spec['label']['y1']
    r_of = wall_radius_fn(spec['profile'], y0, y1)

    # the mockups the art was measured on, before the vessel was scaled to its true size
    mock = spec.get('mockup', {'r': 1.0, 'y': 1.0})
    k_art = mock['y']                                   # art scale: fits the height, keeps shape
    r_mock = lambda y: r_of(y * mock['y']) / mock['r']  # mockup wall radius at mockup height

    W = WIDTH
    px_per_cm = W / (2 * math.pi * spec['radius'])
    H = int(round((y1 - y0) * px_per_cm / 2) * 2)

    # label space: u -> angle (front centred at u = 0.5), row -> height (top row = y1)
    theta = ((np.arange(W) + 0.5) / W - 0.5) * 2 * math.pi            # [-pi, pi)
    ycm = y1 - (np.arange(H) + 0.5) / H * (y1 - y0)
    TH, YC = np.meshgrid(theta, ycm)
    RC = r_of(YC)

    color = np.broadcast_to(SILVER, (H, W, 3)).astype(np.float32).copy()
    ink_total = np.zeros((H, W), np.float32)
    logo_zone = None

    for layer in LAYERS[vessel]:
        p = layer['photo']
        boxes = tuple(layer.get('boxes', p['boxes']))
        th = TH if p['side'] == 'front' else (np.mod(TH, 2 * math.pi) - math.pi)
        s, y = th * RC / k_art, YC / k_art                            # arc offset, height (mockup cm)
        if 'k' in layer:                                              # transplant into place
            (ss, sy), (ds, dy), k = layer['src'], layer['dst'], layer['k']
            s, y = (s - ds) / k + ss, (y - dy) / k + sy
        if p['mode'] == 'flat':
            xs = p['C'] + s * p['pxcm']
            ys = p['y_of_cm'](y)
            valid = np.abs(xs - p['C']) < 0.995 * p['R']
        else:
            r_px = r_mock(y) * p['pxcm']
            t = s / r_mock(y)
            xs = p['C'] + r_px * np.sin(t)
            ys = p['y_of_cm'](y) + r_px * np.cos(t) * p['elev']
            valid = np.abs(t) < math.asin(0.97)

        norm, a_art, a_ink = prepare_photo(p['file'], p['C'], p['R'], p.get('keep', (0.03, 0.09)), boxes)
        coords = [ys.ravel(), xs.ravel()]
        samp = np.stack([map_coordinates(norm[..., c], coords, order=3, mode='nearest')
                         for c in range(3)], axis=-1).reshape(H, W, 3)
        art = map_coordinates(a_art, coords, order=1, mode='constant').reshape(H, W) * valid
        ink = map_coordinates(a_ink, coords, order=1, mode='constant').reshape(H, W) * valid
        color = color * (1 - art[..., None]) + np.clip(samp, 0, 255) * art[..., None]
        ink_total = np.maximum(ink_total, ink * art)

        if 'logo_boxes' in layer:
            lb = box_mask(norm.shape[:2], layer['logo_boxes']).astype(np.float32)
            zone = map_coordinates(lb, coords, order=0, mode='constant').reshape(H, W) * valid
            zy, zx = np.nonzero(zone > 0.5)
            pad = 0.0  # exact art bounds; the runtime composer insets its own frame
            logo_zone = dict(u0=round(float(zx.min() / W - pad), 4), u1=round(float(zx.max() / W + pad), 4),
                             v0=round(float(zy.min() / H - pad), 4), v1=round(float(zy.max() / H + pad), 4))

    rough = ROUGH_METAL + (ROUGH_INK - ROUGH_METAL) * ink_total
    metal = 1.0 - ink_total
    orm = np.stack([np.ones_like(rough), rough, metal], axis=-1)

    OUT.mkdir(parents=True, exist_ok=True)
    col_img = Image.fromarray(np.clip(color + 0.5, 0, 255).astype(np.uint8))
    orm_img = Image.fromarray(np.clip(orm * 255 + 0.5, 0, 255).astype(np.uint8))
    col_img.save(OUT / f'label-{vessel}.webp', quality=90, method=6)
    orm_img.save(OUT / f'label-{vessel}-orm.webp', lossless=True, method=6)
    half = (W // 2, H // 2)
    col_img.resize(half, Image.LANCZOS).save(OUT / f'label-{vessel}-1024.webp', quality=88, method=6)
    orm_img.resize(half, Image.LANCZOS).save(OUT / f'label-{vessel}-orm-1024.webp', lossless=True, method=6)
    print(f'{vessel}: {W}x{H}  logo zone {logo_zone}')
    return dict(width=W, height=H, logoZone=logo_zone)


if __name__ == '__main__':
    layout = {
        '$comment': 'Generated by scripts/build-label-textures.py; do not edit by hand.',
        'silver': '#%02x%02x%02x' % tuple(int(c) for c in SILVER),
        'roughness': {'metal': ROUGH_METAL, 'ink': ROUGH_INK},
    }
    for v in ('can', 'bottle'):
        layout[v] = build(v)
    LAYOUT_OUT.write_text(json.dumps(layout, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(f'wrote {LAYOUT_OUT.relative_to(ROOT)}')
