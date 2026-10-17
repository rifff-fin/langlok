import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { loadLayers } from './film';
import { Vignette, type Scene } from './vignette';

/**
 * A living illustration in the Chatak story (film/vignette.ts). Its own chunk; the film's
 * layers load when it nears the screen (usually already cached by the hero), and it draws
 * on the GSAP ticker only while on screen. Reduced motion: one still frame.
 * The canvas is decorative; the figure around it carries the description.
 */
export default function StoryVignette({ scene }: { scene: Scene }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current!;
    let vignette: Vignette | null = null;
    let alive = true;
    let visible = false;
    let loading = false;
    let still = false; // reduced motion: the one frame is drawn

    const size = () => {
      if (!vignette) return;
      const r = canvas.getBoundingClientRect();
      vignette.resize(r.width, r.height, Math.min(window.devicePixelRatio || 1, 1.5));
      still = false;
    };
    const tick = (time: number) => {
      if (!vignette || !visible) return;
      if (reduced) {
        if (still) return;
        still = true;
      }
      vignette.draw(time);
    };
    const start = () => {
      if (loading) return;
      loading = true;
      loadLayers()
        .then((layers) => {
          if (!alive) return;
          vignette = new Vignette(canvas, layers, scene, !reduced);
          size();
          canvas.dataset.ready = '';
          gsap.ticker.add(tick);
        })
        .catch(() => undefined); // layers missing: the figure's own sky stays
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { rootMargin: '30% 0px' },
    );
    io.observe(canvas);
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    return () => {
      alive = false;
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(tick);
    };
  }, [scene, reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 data-ready:opacity-100"
    />
  );
}
