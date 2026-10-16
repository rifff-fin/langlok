/**
 * Motion preference. The OS setting (prefers-reduced-motion) is the default; the visitor
 * can override it with the Motion switch, remembered per browser. Every motion gate on the
 * site (GSAP matchMedia, Lenis, the 3D scene, CSS) builds its media query here, so the
 * override reaches all of them. Changing it reloads the page: pins, Lenis and the scroll
 * timelines are all built once at load.
 */
export type MotionChoice = 'full' | 'reduced';

const KEY = 'langlok:motion';
const SYSTEM_REDUCED = '(prefers-reduced-motion: reduce)';

function read(): MotionChoice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'full' || v === 'reduced' ? v : null;
  } catch {
    return null; // storage blocked: follow the OS
  }
}

export const motionChoice = read();

// CSS reads this to skip (or force) the reduced-motion transition reset in globals.css.
if (motionChoice) document.documentElement.dataset.motion = motionChoice;

/** Media query that matches while motion is allowed, optionally and-ed with `extra`. */
export function motionQuery(extra?: string) {
  if (motionChoice === 'reduced') return 'not all';
  if (motionChoice === 'full') return extra ?? 'all';
  const q = '(prefers-reduced-motion: no-preference)';
  return extra ? `${extra} and ${q}` : q;
}

/** Media query that matches while motion is reduced, optionally and-ed with `extra`. */
export function reducedQuery(extra?: string) {
  if (motionChoice === 'full') return 'not all';
  if (motionChoice === 'reduced') return extra ?? 'all';
  return extra ? `${extra} and ${SYSTEM_REDUCED}` : SYSTEM_REDUCED;
}

/** Store the visitor's choice (or drop it when it matches the OS) and rebuild the page. */
export function setMotion(reduced: boolean) {
  const systemReduced = window.matchMedia(SYSTEM_REDUCED).matches;
  try {
    if (reduced === systemReduced) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, reduced ? 'reduced' : 'full');
  } catch {
    return; // nothing to remember the choice in; keep the current page
  }
  window.location.reload();
}
