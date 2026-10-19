import type Lenis from 'lenis';

/**
 * The header stays shown until this time (performance.now(), ms): a scroll the site starts
 * itself (a nav link, the logo) must not slide the header away as it runs.
 */
export const headerHold = { until: 0 };

/** Beyond this many screens a link jumps instead of gliding (a long glide drags every
 *  film and spin along the way). */
const GLIDE_SCREENS = 3;

/**
 * End any glide Lenis is still running and re-measure the page. After a route change Lenis
 * can hold the old page's height (it would stop short of a target), and a glide in flight
 * would carry on into the new page. Lenis stays stopped if it was (under the preloader).
 */
export function settleLenis(lenis: Lenis | undefined) {
  if (!lenis) return;
  const stopped = lenis.isStopped;
  lenis.stop(); // stopping ends the glide and syncs Lenis to where the page really is
  lenis.resize();
  if (!stopped) lenis.start();
}

/**
 * Scroll the page to an element (below the header) or to the top: with Lenis when it runs,
 * natively otherwise (reduced motion). Short distances glide, long ones jump.
 */
export function scrollPage(
  lenis: Lenis | undefined,
  target: HTMLElement | 0,
  { immediate = false }: { immediate?: boolean } = {},
) {
  settleLenis(lenis);
  const header = document.querySelector<HTMLElement>('[data-site-header]')?.offsetHeight ?? 0;
  const top =
    target === 0 ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - header);
  const far = Math.abs(top - window.scrollY) > window.innerHeight * GLIDE_SCREENS;
  const jump = immediate || far || !lenis;
  headerHold.until = performance.now() + (jump ? 600 : 1800);
  if (lenis)
    lenis.scrollTo(top, jump ? { immediate: true, force: true } : { duration: 1.2, force: true });
  else window.scrollTo({ top, behavior: 'auto' });
}
