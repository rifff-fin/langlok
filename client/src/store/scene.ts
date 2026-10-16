import { createStore } from 'zustand/vanilla';
import type { ScrollTrigger } from '../lib/gsap';

/** The two 3D vessels. */
export type VesselId = 'can' | 'bottle';

/** DOM boxes the vessels track (the product plates in the static layout). */
export type AnchorId = 'hero-can' | 'products-can' | 'products-bottle' | 'logo-pair';

/** Scroll-driven spins, one full turn each over its section. */
export type SpinId = 'productsCan' | 'productsBottle' | 'logo';

export interface SceneState {
  anchors: Partial<Record<AnchorId, HTMLElement>>;
  /**
   * ScrollTriggers whose progress drives each spin. The 3D reads `trigger.progress` every
   * frame, so state is deterministic in both scroll directions and nothing re-renders.
   */
  spins: Partial<Record<SpinId, ScrollTrigger>>;
}

export const sceneStore = createStore<SceneState>()(() => ({ anchors: {}, spins: {} }));

export function registerAnchor(id: AnchorId, el: HTMLElement | null) {
  sceneStore.setState((s) => {
    const anchors = { ...s.anchors };
    if (el) anchors[id] = el;
    else delete anchors[id];
    return { anchors };
  });
}

/** Transient write: ScrollTriggers are mutable objects, no subscriber needs to know. */
export function registerSpin(id: SpinId, trigger: ScrollTrigger | null) {
  const { spins } = sceneStore.getState();
  if (trigger) spins[id] = trigger;
  else delete spins[id];
}
