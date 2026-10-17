import { preloader as copy } from '../content/copy';
import { gsap } from './gsap';
import { reducedQuery } from './motion';
import { hasWebGL } from './webgl';

/**
 * 00 Preloader (master plan §4.3). The drop, the ripple and the line are static HTML and CSS
 * in index.html, so they show with the first frame, before any script. This fills the line
 * while the home page's first screen gets ready (the fonts, the can's still, the live 3D
 * can), then the line runs across the screen and the mist parts along it: the opening
 * screen is revealed from its middle, where the can rises into place.
 *
 * Shown for at least MIN_MS and at most MAX_MS from navigation start (the 3D can arrives
 * later on slow connections; its still stands in meanwhile). The page beneath is rendered
 * all along (so it counts for first paint) but held: no scrolling, no focus, and the can's
 * entrance and the headline wait for the reveal (`whenRevealed`).
 */
const MIN_MS = 1000; // the drop has landed and the line has formed
const MAX_MS = 3000;

const el = document.getElementById('preloader');
let revealed = !el;
let started = false;
const waiting: (() => void)[] = [];

/** False while the preloader covers the page. */
export const isRevealed = () => revealed;

/** Run `cb` when the page is revealed (at once if it already is). */
export function whenRevealed(cb: () => void) {
  if (revealed) cb();
  else waiting.push(cb);
}

function release() {
  if (revealed) return;
  revealed = true;
  document.documentElement.classList.remove('preloading');
  const root = document.getElementById('root');
  if (root) root.inert = false;
  for (const cb of waiting.splice(0)) cb();
}

const sleep = (ms: number) => new Promise((done) => setTimeout(done, Math.max(0, ms)));

/** The live 3D scene has compiled with the vessels' textures (three/Scene.tsx `Ready`). */
function webglReady() {
  const html = document.documentElement;
  if (html.dataset.webgl === 'ready') return Promise.resolve();
  return new Promise<void>((done) => {
    const watch = new MutationObserver(() => {
      if (html.dataset.webgl !== 'ready') return;
      watch.disconnect();
      done();
    });
    watch.observe(html, { attributes: true, attributeFilter: ['data-webgl'] });
  });
}

/** The faces the opening screen sets its headline in. */
function fonts() {
  return Promise.all([
    document.fonts.load('300 1em Jost'),
    document.fonts.load('italic 400 1em "Bodoni Moda"'),
  ]).then(() => document.fonts.ready);
}

/** Starts once, after the app's first render (the can's still is in the page by then). */
export async function runPreloader() {
  if (!el || started) return;
  started = true;
  el.removeAttribute('aria-hidden');
  el.setAttribute('role', 'progressbar');
  el.setAttribute('aria-label', copy.label);
  el.setAttribute('aria-valuemin', '0');
  el.setAttribute('aria-valuemax', '100');

  let progress = 0;
  const show = (p: number) => {
    progress = Math.min(1, p);
    el.style.setProperty('--p', String(Math.max(0.06, progress)));
    el.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  };
  show(0);

  try {
    const still = document.querySelector<HTMLImageElement>('[data-vessel-plate] img');
    const tasks: [Promise<unknown>, number][] = [[fonts(), 1]];
    if (still) tasks.push([still.decode(), 1.5]);
    if (hasWebGL()) tasks.push([webglReady(), 2.5]);
    const total = tasks.reduce((sum, [, w]) => sum + w, 0);
    for (const [task, w] of tasks) {
      task.then(
        () => show(progress + w / total),
        () => show(progress + w / total),
      );
    }
    const ready = Promise.allSettled(tasks.map(([task]) => task));
    const now = performance.now();
    await Promise.race([Promise.all([ready, sleep(MIN_MS - now)]), sleep(MAX_MS - now)]);
  } catch {
    // whatever happened, never keep the page covered
  }
  show(1);
  reveal(el);
}

function reveal(cover: HTMLElement) {
  const done = () => cover.remove();
  if (window.matchMedia(reducedQuery()).matches) {
    gsap.to(cover, {
      autoAlpha: 0,
      duration: 0.45,
      ease: 'power1.out',
      onStart: release,
      onComplete: done,
    });
    return;
  }
  const line = cover.querySelector<HTMLElement>('.pl-line')!;
  const [top, bottom] = cover.querySelectorAll<HTMLElement>('.pl-half');
  // hand the line over from its CSS entrance to the timeline
  line.style.animation = 'none';
  line.style.transform = 'scaleX(1)';
  // dev only: /?slowmo=6 plays the reveal six times slower, to check it frame by frame
  const slow = import.meta.env.DEV ? Number(new URLSearchParams(location.search).get('slowmo')) : 0;
  gsap
    .timeline({ onComplete: done })
    .timeScale(slow > 0 ? 1 / slow : 1)
    .to(line, {
      scaleX: window.innerWidth / Math.max(1, line.offsetWidth),
      duration: 0.5,
      ease: 'power3.inOut',
      delay: 0.2, // let the fill finish
    })
    .add(release, '-=0.12')
    .to(top, { yPercent: -100, duration: 1.05, ease: 'expo.inOut' }, '-=0.12')
    .to(bottom, { yPercent: 100, duration: 1.05, ease: 'expo.inOut' }, '<')
    .to(line, { opacity: 0, duration: 0.3, ease: 'power1.out' }, '<');
}
