import type { Logo } from '../store/configurator';
import { cpuCanvas } from './compose';

/**
 * Reads an uploaded logo for the preview (loaded only when someone uploads one):
 *   - the type is checked from the file's content, not its name or MIME type;
 *   - PNG and JPEG sizes are read from their headers before anything is decoded;
 *   - SVGs are sanitised with DOMPurify (its own chunk) and rasterised large, so they print
 *     crisply and nothing in them can run;
 *   - a plain white background (JPEGs, flat PNGs) is taken out from the edges inwards, and
 *     empty margins are trimmed, so the logo fills the print area.
 * The original file is kept untouched for the quote request.
 */
export type UploadErrorCode = 'type' | 'size' | 'read' | 'dimensions';

export class UploadError extends Error {
  constructor(public code: UploadErrorCode) {
    super(code);
  }
}

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 8000;
const MAX_PIXELS = 40_000_000;
/** Logos are kept at most this many pixels across (the print area is ~600 px). */
const WORK = 1600;

export async function readLogo(file: File): Promise<Logo> {
  if (file.size > MAX_BYTES) throw new UploadError('size');
  const head = new Uint8Array(await file.slice(0, 64 * 1024).arrayBuffer());
  const kind = sniff(head);
  if (!kind) throw new UploadError('type');

  if (kind === 'svg') {
    const image = trim(await rasteriseSvg(await file.text()));
    return { image, file, kind, keyed: false };
  }

  const size = kind === 'png' ? pngSize(head) : jpegSize(head);
  if (size && (size.w > MAX_SIDE || size.h > MAX_SIDE || size.w * size.h > MAX_PIXELS)) {
    throw new UploadError('dimensions');
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UploadError('read');
  }
  const flat = fit(bitmap, bitmap.width, bitmap.height);
  bitmap.close();
  const keyed = removeWhiteBackground(flat);
  return { image: trim(flat), file, kind, keyed };
}

/* ---------------------------------------------------------------- type and size */

function sniff(b: Uint8Array): Logo['kind'] | null {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((v, i) => b[i] === v)) return 'png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  let text = new TextDecoder().decode(b.subarray(0, 8192));
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // byte-order mark
  const svg =
    /^\s*(<\?xml[\s\S]*?\?>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^[>]*(\[[\s\S]*?\])?\s*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i;
  return svg.test(text) ? 'svg' : null;
}

/** Width and height from a PNG's IHDR chunk. */
function pngSize(b: Uint8Array) {
  if (b.length < 24) return null;
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  return { w: v.getUint32(16), h: v.getUint32(20) };
}

/** Width and height from a JPEG's first start-of-frame marker (if it is in the head). */
function jpegSize(b: Uint8Array) {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    if (marker === 0xff) {
      i++;
      continue;
    }
    const len = (b[i + 2] << 8) | b[i + 3];
    const sof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (sof) return { h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8] };
    i += 2 + len;
  }
  return null;
}

/* ---------------------------------------------------------------- SVG */

async function rasteriseSvg(text: string): Promise<HTMLCanvasElement> {
  // XML first, so entity references (old Illustrator exports) are expanded
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') {
    throw new UploadError('read');
  }
  const xml = new XMLSerializer().serializeToString(doc.documentElement);
  const { default: DOMPurify } = await import('dompurify');
  const clean = DOMPurify.sanitize(xml, {
    USE_PROFILES: { svg: true, svgFilters: true },
    RETURN_DOM_FRAGMENT: true,
  });
  const svg = clean.querySelector('svg');
  if (!svg) throw new UploadError('read');

  const box = svgBox(svg);
  const scale = WORK / Math.max(box.w, box.h);
  const w = Math.max(1, Math.round(box.w * scale));
  const h = Math.max(1, Math.round(box.h * scale));
  if (!svg.hasAttribute('viewBox')) svg.setAttribute('viewBox', `0 0 ${box.w} ${box.h}`);
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));

  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }),
  );
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = cpuCanvas(w, h);
    c.getContext('2d')!.drawImage(img, 0, 0, w, h);
    return c;
  } catch {
    throw new UploadError('read');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** The drawing's size: its viewBox, else its width and height, else a square. */
function svgBox(svg: SVGSVGElement | Element) {
  const vb = (svg.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) return { w: vb[2], h: vb[3] };
  const w = parseFloat(svg.getAttribute('width') ?? '');
  const h = parseFloat(svg.getAttribute('height') ?? '');
  if (w > 0 && h > 0) return { w, h };
  return { w: 1000, h: 1000 };
}

/* ---------------------------------------------------------------- pixels */

/** Onto a canvas, scaled down to the working size. */
function fit(src: CanvasImageSource, sw: number, sh: number) {
  const k = Math.min(1, WORK / Math.max(sw, sh));
  const c = cpuCanvas(sw * k, sh * k);
  const x = c.getContext('2d')!;
  x.imageSmoothingQuality = 'high';
  x.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

/**
 * A logo on plain white (a JPEG, a flat PNG): flood-fill the white in from the edges and
 * make it transparent, softly at the anti-aliased rim, so the label shows through around
 * the logo but white inside it stays. Returns whether anything was taken out.
 */
function removeWhiteBackground(c: HTMLCanvasElement) {
  const { width: w, height: h } = c;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  const img = x.getImageData(0, 0, w, h);
  const p = img.data;
  for (let i = 3; i < p.length; i += 4) if (p[i] < 250) return false; // has its own transparency

  const minAt = (k: number) => Math.min(p[k * 4], p[k * 4 + 1], p[k * 4 + 2]);
  const border: number[] = [];
  for (let i = 0; i < w; i++) border.push(i, (h - 1) * w + i);
  for (let j = 1; j < h - 1; j++) border.push(j * w, j * w + w - 1);
  const white = border.filter((k) => minAt(k) > 235).length;
  if (white / border.length < 0.9) return false; // not a plain white ground

  const SOFT = 200; // pixels this light or lighter belong to the ground (and soften the rim)
  const seen = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let top = 0;
  for (const k of border) {
    if (!seen[k] && minAt(k) > SOFT) {
      seen[k] = 1;
      stack[top++] = k;
    }
  }
  while (top > 0) {
    const k = stack[--top];
    const kx = k % w;
    const next = [kx > 0 ? k - 1 : -1, kx < w - 1 ? k + 1 : -1, k - w, k + w];
    for (const n of next) {
      if (n < 0 || n >= w * h || seen[n] || minAt(n) <= SOFT) continue;
      seen[n] = 1;
      stack[top++] = n;
    }
  }
  for (let k = 0; k < w * h; k++) {
    if (!seen[k]) continue;
    const i = k * 4;
    const a = Math.min(1, (255 - minAt(k)) / (255 - SOFT));
    if (a <= 0.01) {
      p[i + 3] = 0;
      continue;
    }
    // un-mix the white, so the rim keeps the logo's own colour
    for (let ch = 0; ch < 3; ch++) p[i + ch] = Math.max(0, (p[i + ch] - 255 * (1 - a)) / a);
    p[i + 3] = Math.round(a * 255);
  }
  x.putImageData(img, 0, 0);
  return true;
}

/** Crop away empty margins (fully transparent rows and columns). */
function trim(c: HTMLCanvasElement) {
  const { width: w, height: h } = c;
  const p = c.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, w, h).data;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (p[(y * w + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new UploadError('read'); // nothing visible in it
  if (x0 === 0 && y0 === 0 && x1 === w - 1 && y1 === h - 1) return c;
  const out = cpuCanvas(x1 - x0 + 1, y1 - y0 + 1);
  out.getContext('2d')!.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}
