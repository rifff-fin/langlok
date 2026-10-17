import { configStore, designOf } from '../store/configurator';
import type { VesselId } from '../store/scene';
import { composeLabel, ensureFonts, labelCanvases, type LabelBase } from './compose';

/**
 * The configurator without WebGL: the printed label drawn flat (its front, where the logo
 * sits), from the same artwork and composer as the 3D label.
 */
const bases = new Map<VesselId, Promise<LabelBase>>();

function image(src: string) {
  const img = new Image();
  img.src = src;
  return img.decode().then(() => img);
}

function loadBase(vessel: VesselId) {
  let base = bases.get(vessel);
  if (!base) {
    base = Promise.all([
      image(`/textures/label-${vessel}-1024.webp`),
      image(`/textures/label-${vessel}-orm-1024.webp`),
    ]).then(([color, orm]) => ({ vessel, color, orm }));
    bases.set(vessel, base);
  }
  return base;
}

/** Draws the front of the label with the current design into `target`. */
export async function renderFlat(vessel: VesselId, target: HTMLCanvasElement) {
  const base = await loadBase(vessel);
  const d = designOf(configStore.getState());
  await ensureFonts(d);
  const { width: w, height: h } = base.color;
  const out = labelCanvases(w, h);
  composeLabel(base, d, out);
  const sx = Math.round(w * 0.22);
  const sw = Math.round(w * 0.56);
  target.width = sw;
  target.height = h;
  target.getContext('2d')!.drawImage(out.color, sx, 0, sw, h, 0, 0, sw, h);
}

/** The flat front of the label as a PNG ("Save preview" without WebGL). */
export async function flatPng(vessel: VesselId) {
  const c = document.createElement('canvas');
  await renderFlat(vessel, c);
  return new Promise<Blob | null>((resolve) => c.toBlob(resolve, 'image/png'));
}
