import {
  CanvasTexture,
  ClampToEdgeWrapping,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  Vector2,
  type WebGLRenderer,
} from 'three';
import {
  composeLabel,
  composeZone,
  ensureFonts,
  labelCanvases,
  zoneCanvases,
  zoneRect,
  type LabelBase,
} from '../configurator/compose';
import {
  configStore,
  DEFAULT_DESIGN,
  designChanged,
  designOf,
  showsVessel,
  type Design,
} from '../store/configurator';
import type { VesselId } from '../store/scene';

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

const baseOf = (vessel: VesselId, brand: LabelSet): LabelBase => ({
  vessel,
  color: brand.map.image as HTMLImageElement,
  orm: brand.orm.image as HTMLImageElement,
});

/**
 * The YOUR LOGO HERE variant: the bird + wordmark zone is cleared to bare metal and a
 * dashed frame with tracked Jost caps is printed in its place (same layout otherwise). It
 * is the configurator's starting design, printed by the same code.
 */
export async function composeYourLogo(vessel: VesselId, brand: LabelSet): Promise<LabelSet> {
  await ensureFonts(DEFAULT_DESIGN);
  const base = baseOf(vessel, brand);
  const out = labelCanvases(base.color.width, base.color.height);
  composeLabel(base, DEFAULT_DESIGN, out);
  return { map: new CanvasTexture(out.color), orm: new CanvasTexture(out.orm) };
}

/**
 * The configurator's label for one vessel, kept in step with the visitor's design. Nothing
 * is made until the first edit (the YOUR LOGO HERE label stands in). After that, a new
 * background reprints and re-uploads the whole label; logo, lettering, size and position
 * only change the logo zone, so only that part is copied to the GPU, at most once a frame.
 * A vessel that isn't on show waits, and catches up when it is chosen. Returns a cleanup.
 */
export function watchDesign(
  vessel: VesselId,
  brand: LabelSet,
  gl: WebGLRenderer,
  onReady: (set: LabelSet | null) => void,
) {
  const base = baseOf(vessel, brand);
  const { width: w, height: h } = base.color;
  const z = zoneRect(base);
  // texture rows run bottom-up (flipY), so the zone's lower edge is its offset
  const at = new Vector2(z.x, h - z.y - z.h);
  let full: ReturnType<typeof labelCanvases> | null = null;
  let zone: ReturnType<typeof zoneCanvases> | null = null;
  let set: LabelSet | null = null;
  // sources for the partial uploads: never given to the renderer, only copied from
  let parts: LabelSet | null = null;
  let printed: Design | null = null;
  let alive = true;
  let frame = 0;
  let busy = false;

  const update = async () => {
    frame = 0;
    const s = configStore.getState();
    if (!s.touched || busy || !showsVessel(s.vessel, vessel)) return;
    const d = designOf(s);
    busy = true;
    await ensureFonts(d);
    busy = false;
    if (!alive) return;
    if (!set || !full || !zone || !parts || !printed) {
      full = labelCanvases(w, h);
      zone = zoneCanvases(base);
      composeLabel(base, d, full, zone);
      set = configureLabel(
        { map: new CanvasTexture(full.color), orm: new CanvasTexture(full.orm) },
        gl,
      );
      parts = { map: new Texture(zone.color), orm: new Texture(zone.orm) };
      onReady(set);
    } else if (d.background !== printed.background || d.hex !== printed.hex) {
      composeLabel(base, d, full, zone);
      set.map.needsUpdate = true;
      set.orm.needsUpdate = true;
    } else {
      composeZone(base, d, zone);
      gl.copyTextureToTexture(parts.map, set.map, null, at);
      gl.copyTextureToTexture(parts.orm, set.orm, null, at);
      // keep the full print current too (a lost context re-uploads from it)
      full.color.getContext('2d')!.drawImage(zone.color, z.x, z.y);
      full.orm.getContext('2d')!.drawImage(zone.orm, z.x, z.y);
    }
    printed = d;
    if (designChanged(designOf(configStore.getState()), d)) schedule(); // changed meanwhile
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(() => void update());
  };

  const unsubscribe = configStore.subscribe((s, prev) => {
    const shownNow = showsVessel(s.vessel, vessel) && !showsVessel(prev.vessel, vessel);
    if (s.touched !== prev.touched || shownNow || designChanged(s, prev)) schedule();
  });
  schedule();
  return () => {
    alive = false;
    unsubscribe();
    cancelAnimationFrame(frame);
    set?.map.dispose();
    set?.orm.dispose();
    onReady(null);
  };
}
