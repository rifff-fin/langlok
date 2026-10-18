import { createStore } from 'zustand/vanilla';
import type { VesselId } from './scene';

/**
 * The configurator (05): the visitor's design, shared by its controls (React), the live
 * label on the 3D vessels (three/labels.ts), the flat no-WebGL preview and the quote form.
 * The 3D subscribes without re-rendering; the drag rotation is a plain object it reads
 * every frame (`configView`).
 */
export type VesselChoice = VesselId | 'both';
export type Background = 'silver' | 'white' | 'navy' | 'custom';
export type BrandFont = 'sans' | 'serif';

/** An uploaded logo, decoded and ready to draw (SVGs sanitised and rasterised large). */
export interface Logo {
  image: HTMLCanvasElement;
  /** The original file, sent with a quote request. */
  file: File;
  kind: 'png' | 'jpg' | 'svg';
  /** A plain white background was taken out for the preview. */
  keyed: boolean;
}

/** Everything that changes the printed label. */
export interface Design {
  background: Background;
  /** Custom background, `#rrggbb`. */
  hex: string;
  logo: Logo | null;
  brandName: string;
  font: BrandFont;
  /** Logo size, % of the print area (20..100). */
  size: number;
  /** Vertical position, -50 (top) .. 50 (bottom), % of the room left in the logo zone. */
  position: number;
}

export interface ConfigState extends Design {
  vessel: VesselChoice;
  /** The last saved preview, attached to a quote request. */
  preview: { blob: Blob; url: string } | null;
  /** Edited since load. Until then the label is the YOUR LOGO HERE print. */
  touched: boolean;
}

export const DEFAULT_DESIGN: Design = {
  background: 'white', // the official VERSA can and bottle are white
  hex: '#2f7fc1',
  logo: null,
  brandName: '',
  font: 'sans',
  size: 70,
  position: 0,
};

export const configStore = createStore<ConfigState>()(() => ({
  ...DEFAULT_DESIGN,
  vessel: 'can',
  preview: null,
  touched: false,
}));

/** Change the printed design (any change makes the label the visitor's own). */
export function setDesign(patch: Partial<Design>) {
  configStore.setState({ ...patch, touched: true });
}

export function setVesselChoice(vessel: VesselChoice) {
  configStore.setState({ vessel });
}

export function setPreview(blob: Blob | null) {
  const old = configStore.getState().preview;
  if (old) URL.revokeObjectURL(old.url);
  configStore.setState({ preview: blob ? { blob, url: URL.createObjectURL(blob) } : null });
}

/** Back to the YOUR LOGO HERE label, facing front. */
export function resetDesign() {
  setPreview(null);
  configStore.setState({ ...DEFAULT_DESIGN });
  resetView();
}

const DESIGN_KEYS = Object.keys(DEFAULT_DESIGN) as (keyof Design)[];

/** The design part of the state (a stable shape for the label composer). */
export function designOf(s: Design): Design {
  return Object.fromEntries(DESIGN_KEYS.map((k) => [k, s[k]])) as unknown as Design;
}

export function designChanged(a: Design, b: Design) {
  return DESIGN_KEYS.some((k) => a[k] !== b[k]);
}

/** `#abc`, `ABCDEF`… as `#aabbcc`, or null when it isn't a colour. */
export function normaliseHex(value: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  const hex = m[1].length === 3 ? [...m[1]].map((ch) => ch + ch).join('') : m[1];
  return `#${hex.toLowerCase()}`;
}

/** Which vessels the preview shows. */
export function showsVessel(choice: VesselChoice, id: VesselId) {
  return choice === 'both' || choice === id;
}

/**
 * The visitor's turn of the preview (drag, arrow keys), radians; read by the 3D every
 * frame while a vessel stands in the configurator. Pitch stays within a small tilt.
 */
export const configView = { yaw: 0, pitch: 0 };
export const PITCH_LIMIT = 0.32;

export function turnView(dYaw: number, dPitch: number) {
  configView.yaw += dYaw;
  configView.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, configView.pitch + dPitch));
}

/** Face the front again by the shortest way round. */
export function resetView() {
  configView.yaw = Math.round(configView.yaw / (Math.PI * 2)) * Math.PI * 2;
  configView.pitch = 0;
}

/**
 * Renders the 3D view inside `rect` (viewport px) to a PNG. Registered by the 3D scene
 * once it runs; null without WebGL (the flat label is saved instead).
 */
export const capture: { fn: ((rect: DOMRect) => Promise<Blob | null>) | null } = { fn: null };
