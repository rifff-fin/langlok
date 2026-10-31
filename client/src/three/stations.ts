import { reducedQuery } from '../lib/motion';
import { sceneStore, type AnchorId, type SpinId, type VesselId } from '../store/scene';
import spec from './vesselSpec.json';

/**
 * Where each vessel lives on the page. A station is a DOM anchor (a vessel plate in the
 * static layout) whose height represents the vessel's frame (`vesselSpec.json`), so the
 * vessel keeps its real proportions and lands exactly on the still it replaces. Between
 * consecutive stations a vessel either `travel`s (glides from one to the next while the
 * content scrolls past, staying on the viewport's vertical centre line) or `cut`s
 * (switches while unseen). A `dive` station holds the vessel while its move runs: in the
 * hero the can tips its lid into the camera, and when the move ends the can is gone until
 * the next station scrolls in.
 */
interface Station {
  anchor: AnchorId;
  /** Centimetres the anchor's height represents (default: the vessel's frame height). */
  fitCm?: number;
  dive?: SpinId;
}

/** `travel-wide` glides on wide screens only; on phones the vessel is too large to glide over text. */
type Link = 'travel' | 'travel-wide' | 'cut';

interface Route {
  stations: Station[];
  links: Link[];
  spins: SpinId[];
}

const ROUTES: Record<VesselId, Route> = {
  can: {
    stations: [
      { anchor: 'stage-can' },
      { anchor: 'hero-intro', dive: 'heroDive' },
      { anchor: 'hero-can' },
      { anchor: 'products-can' },
      { anchor: 'logo-can' },
      { anchor: 'config-can' },
    ],
    links: ['cut', 'cut', 'travel-wide', 'cut', 'travel-wide'],
    spins: ['productsCan', 'logo'],
  },
  bottle: {
    stations: [
      { anchor: 'stage-bottle' },
      // "Meet VERSA": the bottle stands beside the can there, and stays while the can glides
      // on to its panel; it comes back at its own panel (cut while unseen)
      { anchor: 'hero-bottle' },
      { anchor: 'products-bottle' },
      { anchor: 'logo-bottle' },
      { anchor: 'config-bottle' },
    ],
    links: ['cut', 'cut', 'travel', 'travel-wide'],
    spins: ['productsBottle', 'logo'],
  },
};

/** The configurator's stations: there the vessel wears the visitor's design. */
const CONFIG = new Set<AnchorId>(['config-can', 'config-bottle']);

/** Which print a vessel wears: the client's, YOUR LOGO HERE, or the visitor's design. */
export type VesselLabel = 'brand' | 'yourlogo' | 'config';

const VESSELS = Object.keys(ROUTES) as VesselId[];

export interface VesselTarget {
  visible: boolean;
  /** Vessel centre in viewport px. */
  x: number;
  y: number;
  /** Screen px per cm (vessel units). */
  pxPerCm: number;
  /** Target spin in turns; each section adds one full turn, travels add one more. */
  turns: number;
  /** Lean into the direction of travel, radians. */
  lean: number;
  /** The print wanted: YOUR LOGO HERE from the second half of the logo spin, the
   *  visitor's design at the configurator. */
  label: VesselLabel;
  /** Hero dive progress, 0..1 (0 at every other station). */
  dive: number;
  /** The station the vessel is at, arriving at or leaving. */
  station: AnchorId | null;
  /** Standing at its station (not gliding between two). */
  settled: boolean;
}

const blank = (): VesselTarget => ({
  visible: false,
  x: 0,
  y: 0,
  pxPerCm: 1,
  turns: 0,
  lean: 0,
  label: 'brand',
  dive: 0,
  station: null,
  settled: true,
});

/** Written once per frame by `updateTargets`, read by the vessels in `useFrame`. */
export const targets: Record<VesselId, VesselTarget> = { can: blank(), bottle: blank() };

/** Scene-wide state the vessels read alongside their targets. */
export const stage = {
  /** Full motion: idle drift, pointer tilt, glides and the dive. Reduced: still, in place, cuts. */
  motion: true,
  /** Studio stills (dev): no drift at all. */
  still: false,
  /** Pointer from the viewport centre, -1..1 (hover devices only). */
  pointer: { x: 0, y: 0 },
};

const reduced = window.matchMedia(reducedQuery());

type Placed = { x: number; y: number; pxPerCm: number };
type Present = { i: number; st: Station; p: Placed; dive?: number };

/** Each turn completes before its pin releases, then holds the front view for a moment. */
const SPIN_END: Partial<Record<SpinId, number>> = {
  productsCan: 0.85,
  productsBottle: 0.85,
  logo: 0.8,
};
const spinProgress = (p: number, id: SpinId) => Math.min(1, p / (SPIN_END[id] ?? 1));

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * (3 - 2 * t);
export const smoothstep = (a: number, b: number, t: number) => smooth(clamp01((t - a) / (b - a)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Resolve every vessel's target from its anchors' current rects. Returns whether any
 * vessel is on screen (the render loop sleeps otherwise).
 */
export function updateTargets(vw: number, vh: number): boolean {
  const { anchors, spins, still } = sceneStore.getState();
  const motion = !reduced.matches && !still;
  stage.motion = motion;
  stage.still = still;
  const mid = vh / 2;
  let anyVisible = false;

  for (const id of VESSELS) {
    const route = ROUTES[id];
    const heightCm = spec[id].height;
    const t = targets[id];

    const present: Present[] = [];
    route.stations.forEach((st, i) => {
      const el = anchors[st.anchor];
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        pxPerCm: r.height / (st.fitCm ?? spec[id].frame.h),
      };
      // the dive only runs with full motion; otherwise the station behaves like any other
      const dive = motion && st.dive ? spins[st.dive]?.progress : undefined;
      present.push({ i, st, p, dive });
    });
    if (present.length === 0) {
      t.visible = false;
      continue;
    }

    // A station is behind the viewer once it crosses the centre line (or its dive ends).
    const passed = (s: Present) => (s.dive !== undefined ? s.dive >= 1 : s.p.y < mid);

    let travelTurns = 0;
    let lean = 0;
    let dive = 0;
    let gone = false;
    let settled = true;
    let at = present[present.length - 1].p;
    let station: AnchorId = present[present.length - 1].st.anchor;
    for (let k = 0; k < present.length; k++) {
      const a = present[k];
      const b = present[k + 1];
      if (!passed(a)) {
        // still arriving with its section (only reachable for the first station)
        at = a.p;
        station = a.st.anchor;
        if (a.dive !== undefined) {
          // the lid comes to the middle of the screen as it tips towards the camera
          dive = a.dive;
          const focus = smoothstep(0.1, 0.8, dive);
          at = {
            x: lerp(a.p.x, vw / 2, focus),
            y: lerp(a.p.y, vh / 2, focus),
            pxPerCm: a.p.pxPerCm,
          };
        }
        break;
      }
      if (!b) {
        gone = a.dive !== undefined; // a finished dive leaves nothing behind
        station = a.st.anchor;
        break;
      }
      const link = route.links[a.i];
      const travel =
        motion && b.i === a.i + 1 && (link === 'travel' || (link === 'travel-wide' && vw >= 768));
      if (passed(b)) {
        if (travel) travelTurns += 1;
        continue; // both behind: keep walking down the route
      }
      // a is behind the viewer, b ahead: in between these two stations
      if (travel) {
        const da = a.p.y - mid;
        const db = b.p.y - mid;
        let f = -da / (db - da);
        if (db < 4) f = 1; // snap so the turn completes exactly as b arrives
        const e = smooth(f);
        at = {
          x: lerp(a.p.x, b.p.x, e),
          y: lerp(a.p.y, b.p.y, f), // linear: stays on the centre line while content scrolls
          pxPerCm: lerp(a.p.pxPerCm, b.p.pxPerCm, e),
        };
        station = f < 0.5 ? a.st.anchor : b.st.anchor;
        settled = f >= 1;
        travelTurns += e;
        lean = Math.sin(Math.PI * f) * 0.09 * Math.sign(b.p.x - a.p.x || 1);
      } else if (a.dive !== undefined) {
        at = b.p; // after the dive the vessel waits, unseen, for the next station
        station = b.st.anchor;
      } else {
        const nearA = Math.abs(a.p.y - mid) < Math.abs(b.p.y - mid);
        at = nearA ? a.p : b.p;
        station = nearA ? a.st.anchor : b.st.anchor;
      }
      break;
    }

    let turns = travelTurns;
    for (const s of route.spins) turns += spinProgress(spins[s]?.progress ?? 0, s);

    t.x = at.x;
    t.y = at.y;
    t.pxPerCm = at.pxPerCm;
    t.turns = turns;
    t.lean = lean;
    t.dive = dive;
    t.station = station;
    t.settled = settled;
    t.label = CONFIG.has(station)
      ? 'config'
      : spinProgress(spins.logo?.progress ?? 0, 'logo') > 0.5
        ? 'yourlogo'
        : 'brand';

    const halfH = (heightCm / 2) * at.pxPerCm * 1.15;
    const halfW = spec[id].radius * at.pxPerCm * 2;
    t.visible =
      !gone &&
      (dive > 0 ||
        (at.y + halfH > 0 && at.y - halfH < vh && at.x + halfW > 0 && at.x - halfW < vw));
    anyVisible ||= t.visible;
  }
  return anyVisible;
}
