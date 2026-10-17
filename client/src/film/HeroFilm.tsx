import { useEffect, useRef, type RefObject } from 'react';
import { gsap, type ScrollTrigger } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { whenRevealed } from '../lib/preloader';
import { Film, loadLayers } from './film';

/**
 * Mounts the living film in the hero's sky layer. Its layers load when the browser is idle
 * (the opening screen is the 3D can, so the film is never first paint); until then the
 * layer's CSS sky shows. It draws on the GSAP ticker (the site's one clock), and only while
 * the sky layer is visible.
 */
export default function HeroFilm({ trigger }: { trigger: RefObject<ScrollTrigger | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = canvas.current!;
    const sky = el.parentElement!;
    const stage = sky.parentElement!;
    const pointer = { x: 0, y: 0 };
    let film: Film | null = null;
    let alive = true;
    let shown = 0;
    let lastDrawn = -1;
    let dirty = true;

    const size = () => {
      if (!film) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      // soft imagery: fill rate matters more than pixels
      const dpr = Math.min(window.devicePixelRatio || 1, w > 900 ? 1.25 : 1.5);
      film.resize(w, h, dpr);
      dirty = true;
    };
    const ro = new ResizeObserver(size);
    ro.observe(stage);
    const point = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', point, { passive: true });

    const tick = (time: number, deltaTime: number) => {
      const st = trigger.current;
      if (!film || !st) return;
      const opacity =
        (parseFloat(sky.style.opacity) || 0) * (parseFloat(stage.style.opacity || '1') || 0);
      const r = stage.getBoundingClientRect();
      if (opacity < 0.01 || r.bottom <= 0 || r.top >= window.innerHeight) return;
      const target = st.progress;
      if (reduced) {
        // nothing moves on its own: redraw only when the scroll position changes
        if (!dirty && target === lastDrawn) return;
        shown = target;
      } else {
        shown += (target - shown) * (1 - Math.exp((-deltaTime / 1000) * 7));
      }
      film.draw(shown, time, st.getVelocity(), pointer);
      lastDrawn = target;
      dirty = false;
    };

    const start = () => {
      loadLayers()
        .then((layers) => {
          if (!alive) return;
          film = new Film(el, layers, !reduced);
          shown = trigger.current?.progress ?? 0;
          size();
          el.dataset.ready = '';
          gsap.ticker.add(tick);
        })
        .catch(() => undefined); // layers missing: the CSS sky stays
    };
    // after the preloader (which waits for the can, not for these), when the browser is idle
    let cancel = () => {};
    whenRevealed(() => {
      if (!alive) return;
      if ('requestIdleCallback' in window) {
        const id = requestIdleCallback(start, { timeout: 2500 });
        cancel = () => cancelIdleCallback(id);
      } else {
        const id = setTimeout(start, 1500);
        cancel = () => clearTimeout(id);
      }
    });

    return () => {
      alive = false;
      cancel();
      ro.disconnect();
      window.removeEventListener('pointermove', point);
      gsap.ticker.remove(tick);
    };
  }, [trigger, reduced]);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 data-ready:opacity-100"
    />
  );
}
