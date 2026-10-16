import { sceneStore, type AnchorId, type SpinId, type VesselId } from '../store/scene';
import spec from './vesselSpec.json';

/**
 * Where each vessel lives on the page. A station is a DOM anchor (a product plate in the
 * static layout); `fitCm` is how many centimetres the anchor's height represents, so the
 * vessel keeps its real proportions. Between consecutive stations a vessel either
 * `travel`s (glides from one to the next while the content scrolls past, staying at the
 * viewport's vertical centre) or `cut`s (switches while both are off-screen).
 */
interface Station {
  anchor: AnchorId;
  fitCm: number;
  xFrac?: number;
  align?: 'center' | 'bottom';
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
      { anchor: 'hero-can', fitCm: 22 },
      { anchor: 'products-can', fitCm: 22 },
      { anchor: 'logo-pair', fitCm: 27.5, xFrac: 0.255, align: 'bottom' },
    ],
    links: ['travel-wide', 'cut'],
    spins: ['productsCan', 'logo'],
  },
  bottle: {
    stations: [
      { anchor: 'products-bottle', fitCm: 28 },
      { anchor: 'logo-pair', fitCm: 27.5, xFrac: 0.745, align: 'bottom' },
    ],
    links: ['travel'],
    spins: ['productsBottle', 'logo'],
  },
};

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
  /** YOUR LOGO HERE label wanted (second half of the logo spin). */
  logo: boolean;
}

const blank = (): VesselTarget => ({
  visible: false,
  x: 0,
  y: 0,
  pxPerCm: 1,
  turns: 0,
  lean: 0,
  logo: false,
});

/** Written once per frame by `updateTargets`, read by the vessels in `useFrame`. */
export const targets: Record<VesselId, VesselTarget> = { can: blank(), bottle: blank() };

type Placed = { x: number; y: number; pxPerCm: number };

function place(st: Station, r: DOMRect, heightCm: number): Placed {
  const pxPerCm = r.height / st.fitCm;
  const x = r.left + r.width * (st.xFrac ?? 0.5);
  const y =
    st.align === 'bottom'
      ? r.bottom - r.height * 0.03 - (heightCm * pxPerCm) / 2
      : r.top + r.height / 2;
  return { x, y, pxPerCm };
}

/** Each turn completes before its pin releases, then holds the front view for a moment. */
const SPIN_END: Record<SpinId, number> = { productsCan: 0.85, productsBottle: 0.85, logo: 0.8 };
const spinProgress = (p: number, id: SpinId) => Math.min(1, p / SPIN_END[id]);

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Resolve every vessel's target from its anchors' current rects. Returns whether any
 * vessel is on screen (the render loop sleeps otherwise).
 */
export function updateTargets(vw: number, vh: number): boolean {
  const { anchors, spins } = sceneStore.getState();
  const mid = vh / 2;
  let anyVisible = false;

  for (const id of Object.keys(ROUTES) as VesselId[]) {
    const route = ROUTES[id];
    const heightCm = spec[id].height;
    const t = targets[id];

    const placed: (Placed | null)[] = route.stations.map((st) => {
      const el = anchors[st.anchor];
      return el ? place(st, el.getBoundingClientRect(), heightCm) : null;
    });
    const present = placed
      .map((p, i) => (p ? { p, i } : null))
      .filter((v): v is { p: Placed; i: number } => v !== null);

    if (present.length === 0) {
      t.visible = false;
      continue;
    }

    // Completed and in-progress travels each contribute up to one turn.
    let travelTurns = 0;
    let lean = 0;
    let at: Placed = present[present.length - 1].p;
    for (let k = 0; k < present.length; k++) {
      const a = present[k];
      const b = present[k + 1];
      const da = a.p.y - mid;
      if (da >= 0) {
        if (k === 0) at = a.p; // still arriving from below with its section
        break;
      }
      if (!b) break;
      const db = b.p.y - mid;
      const link = route.links[a.i];
      const travel =
        b.i === a.i + 1 && (link === 'travel' || (link === 'travel-wide' && vw >= 768));
      if (db < 0) {
        if (travel) travelTurns += 1;
        continue; // both above the centre line: keep walking down the route
      }
      // a is above the centre line, b below: in between these two stations
      if (travel) {
        let f = -da / (db - da);
        if (db < 4) f = 1; // snap so the turn completes exactly as b arrives
        const e = smooth(f);
        at = {
          x: lerp(a.p.x, b.p.x, e),
          y: lerp(a.p.y, b.p.y, f), // linear: stays on the centre line while content scrolls
          pxPerCm: lerp(a.p.pxPerCm, b.p.pxPerCm, e),
        };
        travelTurns += e;
        lean = Math.sin(Math.PI * f) * 0.09 * Math.sign(b.p.x - a.p.x || 1);
      } else {
        at = Math.abs(da) < Math.abs(db) ? a.p : b.p;
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
    t.logo = spinProgress(spins.logo?.progress ?? 0, 'logo') > 0.5;

    const halfH = (heightCm / 2) * at.pxPerCm * 1.15;
    const halfW = spec[id].radius * at.pxPerCm * 2;
    t.visible = at.y + halfH > 0 && at.y - halfH < vh && at.x + halfW > 0 && at.x - halfW < vw;
    anyVisible ||= t.visible;
  }
  return anyVisible;
}
