import { yourLogo } from '../content/copy';
import { normaliseHex, type Design } from '../store/configurator';
import type { VesselId } from '../store/scene';
import layout from '../three/labelLayout.json';

/**
 * Prints a design onto a vessel's label: plain 2D canvas work, shared by the live 3D label
 * (three/labels.ts), the flat preview without WebGL and the YOUR LOGO HERE print of
 * section 04 (the configurator's starting point, so the two always match).
 *
 * A label is a colour map plus an ORM map (G = roughness, B = metalness). The client's
 * artwork is kept everywhere except the logo zone, where the bird and wordmark were; the
 * ORM map says where its ink is, so a coloured background can be laid under the same print
 * (in white on dark colours).
 */

type Img = CanvasImageSource & { width: number; height: number };

export interface LabelBase {
  vessel: VesselId;
  /** The client's label artwork and its ORM map (bare metal vs printed ink). */
  color: Img;
  orm: Img;
}

export interface LabelCanvases {
  color: HTMLCanvasElement;
  orm: HTMLCanvasElement;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const INK = '#16233f';
const PAPER = '#f4f6f7';
export const VERSA_WHITE = '#f3f4f4';
/**
 * Where a printed (non-silver) can stays bare metal: the label's top and bottom edge rows,
 * which the texture clamps to beyond the print (the can's rim and its base; the bottle's
 * base, while its neck is printed too).
 */
const RIMS: Record<VesselId, { top: boolean; bottom: boolean }> = {
  can: { top: true, bottom: true },
  bottle: { top: false, bottom: true },
};
const orm = (roughness: number, metalness: number) =>
  `rgb(255, ${Math.round(roughness * 255)}, ${Math.round(metalness * 255)})`;
const ORM_METAL = orm(layout.roughness.metal, 1);
const ORM_INK = orm(layout.roughness.ink, 0);

export function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

const ctx2d = (c: HTMLCanvasElement) => c.getContext('2d')!;

/**
 * A canvas kept in main memory rather than on the GPU: for pixels that are redrawn and
 * re-uploaded often (the logo zone, logos), where a GPU canvas would have to be read back.
 */
export function cpuCanvas(w: number, h: number) {
  const c = canvas(w, h);
  c.getContext('2d', { willReadFrequently: true });
  return c;
}

export function labelCanvases(w: number, h: number): LabelCanvases {
  return { color: canvas(w, h), orm: canvas(w, h) };
}

/** The logo zone in label pixels (whole pixels: it is re-uploaded on its own). */
export function zoneRect(base: LabelBase): Rect {
  const z = layout[base.vessel].logoZone;
  const { width: w, height: h } = base.color;
  const x = Math.round(z.u0 * w);
  const y = Math.round(z.v0 * h);
  return { x, y, w: Math.round(z.u1 * w) - x, h: Math.round(z.v1 * h) - y };
}

/**
 * The print area inside the zone, in zone pixels. The zone wraps up to ~60° each side of
 * the front, so the print keeps to the front-facing middle.
 */
function printArea(z: Rect): Rect {
  const w = z.w * 0.78;
  const h = Math.min(z.h * 0.62, w * 1.25);
  return { x: (z.w - w) / 2, y: (z.h - h) / 2, w, h };
}

interface Finish {
  /** The label's ground colour. */
  color: string;
  orm: string;
  /** Print in white on it. */
  dark: boolean;
  /** Bare aluminium: the client's artwork as it is. */
  bare: boolean;
}

/** Relative luminance (WCAG), 0..1. */
function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255);
}

/** How the chosen background prints: bare metal, a white basecoat, or a tinted lacquer. */
export function finish(d: Pick<Design, 'background' | 'hex'>): Finish {
  switch (d.background) {
    case 'silver':
      return { color: layout.silver, orm: ORM_METAL, dark: false, bare: true };
    case 'white': // the official VERSA can and bottle: a matte white basecoat
      return { color: VERSA_WHITE, orm: orm(0.5, 0), dark: false, bare: false };
    case 'navy':
      return { color: INK, orm: orm(0.34, 0.5), dark: true, bare: false };
    case 'custom': {
      const color = normaliseHex(d.hex) ?? '#2f7fc1';
      const dark = luminance(color) < 0.3;
      return { color, orm: orm(0.36, dark ? 0.5 : 0.2), dark, bare: false };
    }
  }
}

/** The colour the mark prints in when it is lettering or the placeholder. */
export const inkColor = (f: Finish) => (f.dark ? PAPER : INK);

/* ---------------------------------------------------------------- the client's print */

interface Ink {
  mask?: HTMLCanvasElement;
  light?: HTMLCanvasElement;
  dark?: HTMLCanvasElement;
  orm?: HTMLCanvasElement;
}
const inks = new WeakMap<LabelBase, Ink>();

/** Where the artwork is printed (alpha), from the ORM map's metalness: 0 under ink. */
function inkMask(base: LabelBase) {
  const { width: w, height: h } = base.color;
  const c = canvas(w, h);
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.drawImage(base.orm, 0, 0, w, h);
  const img = x.getImageData(0, 0, w, h);
  const p = img.data;
  for (let i = 0; i < p.length; i += 4) {
    const a = 255 - p[i + 2];
    p[i] = p[i + 1] = p[i + 2] = 255;
    p[i + 3] = a;
  }
  x.putImageData(img, 0, 0);
  return c;
}

/** The artwork's print alone: in its own colours, in white, or as ORM ink. Cached. */
function ink(base: LabelBase, kind: 'light' | 'dark' | 'orm') {
  let entry = inks.get(base);
  if (!entry) inks.set(base, (entry = {}));
  const made = entry[kind];
  if (made) return made;
  const mask = (entry.mask ??= inkMask(base));
  const { width: w, height: h } = base.color;
  const c = canvas(w, h);
  const x = ctx2d(c);
  if (kind === 'light') {
    x.drawImage(base.color, 0, 0, w, h);
  } else {
    x.fillStyle = kind === 'dark' ? PAPER : ORM_INK;
    x.fillRect(0, 0, w, h);
  }
  x.globalCompositeOperation = 'destination-in';
  x.drawImage(mask, 0, 0);
  entry[kind] = c;
  return c;
}

/* ---------------------------------------------------------------- composing */

/**
 * The client's whole print (VERSA artwork included) on a ground: bare aluminium as it is,
 * or a basecoat under the same print. A basecoat leaves the rims bare (`RIMS`).
 */
export function composePrint(
  base: LabelBase,
  d: Pick<Design, 'background' | 'hex'>,
  out: LabelCanvases,
) {
  const { width: w, height: h } = base.color;
  const f = finish(d);
  const c = ctx2d(out.color);
  const o = ctx2d(out.orm);
  if (f.bare) {
    c.drawImage(base.color, 0, 0, w, h);
    o.drawImage(base.orm, 0, 0, w, h);
    return;
  }
  c.fillStyle = f.color;
  c.fillRect(0, 0, w, h);
  c.drawImage(ink(base, f.dark ? 'dark' : 'light'), 0, 0);
  o.fillStyle = f.orm;
  o.fillRect(0, 0, w, h);
  o.drawImage(ink(base, 'orm'), 0, 0);
  const rim = Math.max(1, Math.round(w / 1024));
  const rims = RIMS[base.vessel];
  c.fillStyle = layout.silver;
  o.fillStyle = ORM_METAL;
  for (const [on, y] of [
    [rims.top, 0],
    [rims.bottom, h - rim],
  ] as const) {
    if (!on) continue;
    c.fillRect(0, y, w, rim);
    o.fillRect(0, y, w, rim);
  }
}

/** The whole label: the print on its ground, then the logo zone with the design. */
export function composeLabel(base: LabelBase, d: Design, out: LabelCanvases, zone?: LabelCanvases) {
  const c = ctx2d(out.color);
  const o = ctx2d(out.orm);
  composePrint(base, d, out);
  const z = zoneRect(base);
  const part = zone ?? zoneCanvases(base);
  composeZone(base, d, part);
  c.drawImage(part.color, z.x, z.y);
  o.drawImage(part.orm, z.x, z.y);
}

/** Canvases for the logo zone (uploaded on their own after every edit). */
export function zoneCanvases(base: LabelBase): LabelCanvases {
  const z = zoneRect(base);
  return { color: cpuCanvas(z.w, z.h), orm: cpuCanvas(z.w, z.h) };
}

/**
 * Just the logo zone, on canvases of the zone's size: all that changes while the visitor
 * works on the logo, so only this part is re-uploaded to the GPU.
 */
export function composeZone(base: LabelBase, d: Design, out: LabelCanvases) {
  const z = zoneRect(base);
  const f = finish(d);
  const c = ctx2d(out.color);
  const o = ctx2d(out.orm);
  c.globalCompositeOperation = 'source-over';
  o.globalCompositeOperation = 'source-over';
  c.fillStyle = f.color;
  c.fillRect(0, 0, z.w, z.h);
  o.fillStyle = f.orm;
  o.fillRect(0, 0, z.w, z.h);
  const unit = base.color.width / 2048;
  const area = printArea(z);
  if (d.logo) paintLogo(c, o, z, area, d);
  else if (d.brandName.trim()) paintName(c, o, z, area, d, inkColor(f));
  else paintPlaceholder(c, o, area, unit, inkColor(f));
}

/** Where the mark's centre sits: the position slider moves it within the zone. */
function centreY(z: Rect, contentH: number, position: number) {
  const margin = z.h * 0.05;
  const room = Math.max(0, z.h - 2 * margin - contentH);
  return z.h / 2 + (position / 100) * room;
}

let scratch: HTMLCanvasElement | null = null;

function paintLogo(
  c: CanvasRenderingContext2D,
  o: CanvasRenderingContext2D,
  z: Rect,
  area: Rect,
  d: Design,
) {
  const img = d.logo!.image;
  const s = d.size / 100;
  const k = Math.min((area.w * s) / img.width, (area.h * s) / img.height);
  const dw = Math.max(1, Math.round(img.width * k));
  const dh = Math.max(1, Math.round(img.height * k));
  const dx = Math.round((z.w - dw) / 2);
  const dy = Math.round(centreY(z, dh, d.position) - dh / 2);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  c.drawImage(img, dx, dy, dw, dh);
  // on the ORM map the logo is matte ink, as far as it covers the metal
  scratch ??= cpuCanvas(1, 1);
  scratch.width = dw;
  scratch.height = dh;
  const m = ctx2d(scratch);
  m.imageSmoothingQuality = 'high';
  m.drawImage(img, 0, 0, dw, dh);
  m.globalCompositeOperation = 'source-in';
  m.fillStyle = ORM_INK;
  m.fillRect(0, 0, dw, dh);
  o.drawImage(scratch, dx, dy);
}

function fontFor(d: Design, px: number) {
  return d.font === 'serif'
    ? `italic 500 ${px}px "Bodoni Moda", Didot, Georgia, serif`
    : `500 ${px}px Jost, "Century Gothic", system-ui, sans-serif`;
}

/** A typed brand name, set as large as fits: on one line, or two when that is much larger. */
function paintName(
  c: CanvasRenderingContext2D,
  o: CanvasRenderingContext2D,
  z: Rect,
  area: Rect,
  d: Design,
  color: string,
) {
  const serif = d.font === 'serif';
  const text = serif ? d.brandName.trim() : d.brandName.trim().toUpperCase();
  const track = serif ? 0 : 0.14; // em
  // as wide as a logo (about half the can's face at the default size), but free to grow
  // taller, since lettering is mostly wider than it is tall
  const s = d.size / 100;
  const boxW = area.w * s;
  const boxH = area.h * 0.5 * s;
  const LINE = 1.18;
  const widthAt = (line: string, px: number) => {
    c.font = fontFor(d, px);
    return trackedWidth(c, line, px * track);
  };
  const fit = (lines: string[]) => {
    const w = Math.max(...lines.map((l) => widthAt(l, 100)));
    return Math.min((100 * boxW) / w, boxH / (lines.length * LINE));
  };
  let lines = [text];
  let px = fit(lines);
  const words = text.split(/\s+/);
  if (words.length > 1) {
    let best: string[] = lines;
    let bestPx = 0;
    for (let i = 1; i < words.length; i++) {
      const pair = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
      const p = fit(pair);
      if (p > bestPx) [best, bestPx] = [pair, p];
    }
    if (bestPx > px * 1.25) [lines, px] = [best, bestPx];
  }
  px = Math.max(8, Math.floor(px));
  const total = lines.length * px * LINE;
  const cy = centreY(z, total, d.position);
  for (const [ctx, ink] of [
    [c, color],
    [o, ORM_INK],
  ] as const) {
    ctx.save();
    ctx.font = fontFor(d, px);
    ctx.fillStyle = ink;
    ctx.textBaseline = 'middle';
    lines.forEach((line, i) => {
      trackedText(ctx, line, z.w / 2, cy + (i - (lines.length - 1) / 2) * px * LINE, px * track);
    });
    ctx.restore();
  }
}

/** The YOUR LOGO HERE frame: a dashed box with tracked Jost caps (section 04's print). */
function paintPlaceholder(
  c: CanvasRenderingContext2D,
  o: CanvasRenderingContext2D,
  area: Rect,
  unit: number,
  color: string,
) {
  const size = Math.round(area.w * 0.096); // tracked caps stay well inside the frame on the curve
  const words = yourLogo.placeholder.split(' ');
  const lines = [words.slice(0, -1).join(' '), words[words.length - 1]];
  for (const [ctx, ink] of [
    [c, color],
    [o, ORM_INK],
  ] as const) {
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = 6 * unit;
    ctx.setLineDash([20 * unit, 13 * unit]);
    ctx.beginPath();
    ctx.roundRect(area.x, area.y, area.w, area.h, 18 * unit);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = `600 ${size}px Jost, "Century Gothic", system-ui, sans-serif`;
    ctx.textBaseline = 'middle';
    lines.forEach((line, i) => {
      const y = area.y + area.h / 2 + (i - 0.5) * size * 1.5;
      trackedText(ctx, line, area.x + area.w / 2, y, size * 0.24);
    });
    ctx.restore();
  }
}

function trackedWidth(ctx: CanvasRenderingContext2D, text: string, track: number) {
  const chars = [...text];
  return chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) + track * (chars.length - 1);
}

/** Centred text with manual tracking (canvas letterSpacing is not universal yet). */
function trackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  track: number,
) {
  if (!track) {
    ctx.textAlign = 'center';
    ctx.fillText(text, cx, cy);
    return;
  }
  ctx.textAlign = 'left';
  let x = cx - trackedWidth(ctx, text, track) / 2;
  for (const ch of text) {
    ctx.fillText(ch, x, cy);
    x += ctx.measureText(ch).width + track;
  }
}

/** Wait for the faces a design prints with (the canvas can't wait for them itself). */
export async function ensureFonts(d: Design) {
  const faces = ['600 64px Jost'];
  if (!d.logo && d.brandName.trim()) {
    faces.push(d.font === 'serif' ? 'italic 500 64px "Bodoni Moda"' : '500 64px Jost');
  }
  await Promise.all(faces.map((f) => document.fonts.load(f).catch(() => undefined)));
}
