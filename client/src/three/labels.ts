import {
  CanvasTexture,
  ClampToEdgeWrapping,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
  type WebGLRenderer,
} from 'three';
import { yourLogo } from '../content/copy';
import type { VesselId } from '../store/scene';
import layout from './labelLayout.json';

/** Colour map + ORM map (G = roughness, B = metalness) for one label design. */
export interface LabelSet {
  map: Texture;
  orm: Texture;
}

/** 2048 px labels on wide screens, 1024 px on phones (GPU memory). */
export function labelUrls(vessel: VesselId, wide: boolean) {
  const suffix = wide ? '' : '-1024';
  return {
    map: `/textures/label-${vessel}${suffix}.webp`,
    orm: `/textures/label-${vessel}-orm${suffix}.webp`,
  };
}

/** Texture settings shared by loaded and composed labels. */
export function configureLabel(set: LabelSet, gl: WebGLRenderer) {
  const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
  for (const [tex, srgb] of [
    [set.map, true],
    [set.orm, false],
  ] as const) {
    tex.colorSpace = srgb ? SRGBColorSpace : NoColorSpace;
    tex.wrapS = RepeatWrapping; // u wraps around the vessel
    tex.wrapT = ClampToEdgeWrapping; // v clamps to bare silver above/below the print
    tex.anisotropy = aniso;
    tex.needsUpdate = true;
    gl.initTexture(tex); // upload now, so a label swap never hitches mid-scroll
  }
  return set;
}

const INK = '#16233f';
const ORM_METAL = `rgb(255, ${Math.round(layout.roughness.metal * 255)}, 255)`;
const ORM_INK = `rgb(255, ${Math.round(layout.roughness.ink * 255)}, 0)`;

/**
 * The YOUR LOGO HERE variant: the bird + wordmark zone is cleared to bare metal and a
 * dashed frame with tracked Jost caps is printed in its place (same layout otherwise).
 * Phase 4's configurator reuses this with an uploaded logo instead of the placeholder.
 */
export async function composeYourLogo(vessel: VesselId, base: LabelSet): Promise<LabelSet> {
  await document.fonts.load('600 64px Jost').catch(() => undefined);
  const src = base.map.image as HTMLImageElement;
  const srcOrm = base.orm.image as HTMLImageElement;
  const w = src.width;
  const h = src.height;
  const zone = layout[vessel].logoZone;

  const make = (img: HTMLImageElement) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);
    return { c, ctx };
  };
  const color = make(src);
  const orm = make(srcOrm);

  const zx = zone.u0 * w;
  const zy = zone.v0 * h;
  const zw = (zone.u1 - zone.u0) * w;
  const zh = (zone.v1 - zone.v0) * h;

  color.ctx.fillStyle = layout.silver;
  color.ctx.fillRect(zx, zy, zw, zh);
  orm.ctx.fillStyle = ORM_METAL;
  orm.ctx.fillRect(zx, zy, zw, zh);

  // The zone wraps up to ~60 deg each side; keep the frame to the front-facing middle.
  const fw = zw * 0.78;
  const fh = Math.min(zh * 0.62, fw * 1.25);
  const fx = zx + (zw - fw) / 2;
  const fy = zy + (zh - fh) / 2;
  const unit = w / 2048;
  const size = Math.round(fw * 0.096); // tracked caps stay well inside the frame on the curve

  const paint = (ctx: CanvasRenderingContext2D, ink: string) => {
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = 6 * unit;
    ctx.setLineDash([20 * unit, 13 * unit]);
    ctx.beginPath();
    ctx.roundRect(fx, fy, fw, fh, 18 * unit);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = `600 ${size}px Jost, "Century Gothic", system-ui, sans-serif`;
    ctx.textBaseline = 'middle';
    const words = yourLogo.placeholder.split(' ');
    const lines = [words.slice(0, -1).join(' '), words[words.length - 1]];
    lines.forEach((line, i) => {
      trackedText(ctx, line, fx + fw / 2, fy + fh / 2 + (i - 0.5) * size * 1.5, size * 0.24);
    });
    ctx.restore();
  };
  paint(color.ctx, INK);
  paint(orm.ctx, ORM_INK);

  return { map: new CanvasTexture(color.c), orm: new CanvasTexture(orm.c) };
}

/** Centred text with manual tracking (canvas letterSpacing is not universal yet). */
function trackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  track: number,
) {
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
  let x = cx - total / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, cy);
    x += widths[i] + track;
  });
}
