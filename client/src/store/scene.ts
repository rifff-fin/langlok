import { createStore } from 'zustand/vanilla';
import type { ScrollTrigger } from '../lib/gsap';

/** The two 3D vessels. */
export type VesselId = 'can' | 'bottle';

/**
 * DOM boxes the vessels track (the vessel plates in the static layout). `stage-*` only
 * exist on the dev studio page that renders the fallback stills.
 */
export type AnchorId =
  | 'stage-can'
  | 'stage-bottle'
  | 'hero-intro'
  | 'hero-can'
  | 'hero-bottle'
  | 'products-can'
  | 'products-bottle'
  | 'logo-can'
  | 'logo-bottle'
  | 'config-can'
  | 'config-bottle';

/**
 * Scroll-driven moves: one full turn per section, plus the hero dive (the can tips its
 * lid into the camera and the sky takes over).
 */
export type SpinId = 'heroDive' | 'productsCan' | 'productsBottle' | 'logo';

/** Just the part of a ScrollTrigger the 3D reads (the studio page fakes it). */
export type Progress = Pick<ScrollTrigger, 'progress'>;

export interface SceneState {
  anchors: Partial<Record<AnchorId, HTMLElement>>;
  /**
   * ScrollTriggers whose progress drives each move. The 3D reads `trigger.progress` every
   * frame, so state is deterministic in both scroll directions and nothing re-renders.
   */
  spins: Partial<Record<SpinId, Progress>>;
  /** Studio stills: no idle drift, no pointer tilt. */
  still: boolean;
}

export const sceneStore = createStore<SceneState>()(() => ({
  anchors: {},
  spins: {},
  still: false,
}));

export function registerAnchor(id: AnchorId, el: HTMLElement | null) {
  sceneStore.setState((s) => {
    const anchors = { ...s.anchors };
    if (el) anchors[id] = el;
    else delete anchors[id];
    return { anchors };
  });
}

/** Transient write: ScrollTriggers are mutable objects, no subscriber needs to know. */
export function registerSpin(id: SpinId, trigger: Progress | null | undefined) {
  const { spins } = sceneStore.getState();
  if (trigger) spins[id] = trigger;
  else delete spins[id];
}
