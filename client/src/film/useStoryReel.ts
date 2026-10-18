import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { REEL, REEL_LENGTH, reelAt, reelMoment, reelStart } from './timeline';
import type { Film } from './film';

/** The moment shown without motion: the catch. */
const STILL = 3;
/** Seconds a jump to another moment takes to dissolve. */
const DISSOLVE = 0.6;
/** How much of the film must be on screen before the story starts. */
const START_AT = 0.4;

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

interface Control {
  seek: (i: number) => void;
  play: (on: boolean) => void;
}

/**
 * The Chatak story as a film (section 06): the hero film's story, played by time from the
 * wait to the river once the film is well in view, then held on the river (which keeps
 * living). `ReelFilm` (StoryReel.tsx) draws it, the section makes it fill the window, and
 * `ReelControls` are the five moments to jump to and the pause button. The film module and
 * its layers load as the film nears the screen, and it draws on the GSAP ticker only while
 * on screen. Reduced motion: one still (the catch), and the moments show their stills.
 */
export function useStoryReel() {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fillsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const control = useRef<Control | null>(null);
  const playing = useRef(true);
  const reduced = useReducedMotion();
  const [moment, setMoment] = useState(() => (reduced ? STILL : 0));
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = canvasRef.current!;
    const box = frameRef.current!;
    const pointer = { x: 0, y: 0 };
    let film: Film | null = null;
    let alive = true;
    let visible = false;
    let armed = false; // the story's clock runs once the film is well in view
    let clock = 0; // seconds into the story
    let life = 0; // the film's own clock (breathing, wings, rain); stops while paused
    let still: number = STILL; // the moment shown without motion
    let dirty = true;
    let shown = -1;
    let from: HTMLCanvasElement | null = null; // the frame a jump dissolves from
    let fade = 1;

    const size = () => {
      if (!film) return;
      const r = box.getBoundingClientRect();
      // soft imagery: fill rate matters more than pixels (as in the hero)
      const dpr = Math.min(window.devicePixelRatio || 1, r.width > 900 ? 1.25 : 1.5);
      film.resize(r.width, r.height, dpr);
      dirty = true;
    };

    const progress = () => {
      const now = reduced ? still : reelMoment(clock);
      REEL.forEach((m, i) => {
        const k = reduced ? (i <= still ? 1 : 0) : clamp((clock - reelStart(i)) / m.s, 0, 1);
        const fill = fillsRef.current[i];
        if (fill) fill.style.transform = `scaleX(${k})`;
      });
      if (now !== shown) {
        shown = now;
        setMoment(now);
      }
    };

    const tick = (_time: number, deltaMs: number) => {
      if (!film || !visible) return;
      if (reduced) {
        if (!dirty) return;
        film.draw(REEL[still].still, 0, 0, pointer);
      } else {
        const on = playing.current;
        if (!on && !dirty) return; // paused: the frame holds
        const dt = on ? Math.min(0.1, deltaMs / 1000) : 0;
        life += dt;
        if (armed) clock = Math.min(REEL_LENGTH, clock + dt);
        film.draw(reelAt(clock), life, 0, pointer);
        if (from && fade < 1) {
          fade = Math.min(1, fade + dt / DISSOLVE);
          const ctx = el.getContext('2d')!;
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.globalAlpha = 1 - fade * fade * (3 - 2 * fade);
          ctx.drawImage(from, 0, 0, el.width, el.height);
          ctx.restore();
        }
      }
      dirty = false;
      progress();
    };

    control.current = {
      seek(i) {
        if (reduced) {
          still = i;
        } else {
          if (film && el.width > 0) {
            from ??= document.createElement('canvas');
            from.width = el.width;
            from.height = el.height;
            from.getContext('2d')!.drawImage(el, 0, 0);
            fade = 0;
          }
          clock = reelStart(i);
          armed = true;
          playing.current = true;
          setPaused(false);
        }
        dirty = true;
        if (!film) progress();
      },
      play(on) {
        playing.current = on;
        if (!on) fade = 1; // a pause lands the dissolve
        dirty = true;
      },
    };

    const load = () => {
      import('./film')
        .then(async ({ Film, loadLayers }) => {
          const layers = await loadLayers();
          if (!alive) return;
          film = new Film(el, layers, !reduced, false);
          size();
          el.dataset.ready = '';
          gsap.ticker.add(tick);
        })
        .catch(() => alive && setFailed(true)); // the film keeps its sky; no controls
    };

    // load as the film nears the screen; start the story once it is well in view, and
    // start it again next time if it had finished while the visitor was away
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        load();
      },
      { rootMargin: '60% 0px' },
    );
    const watch = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (entry.intersectionRatio >= START_AT) armed = true;
        if (!visible && clock >= REEL_LENGTH) {
          clock = 0;
          armed = false;
          fade = 1;
        }
      },
      { threshold: [0, START_AT] },
    );
    near.observe(box);
    watch.observe(box);
    const ro = new ResizeObserver(size);
    ro.observe(box);

    // the words lie over the film, so the pointer is followed on the whole page (desktop
    // parallax, as in the hero)
    const point = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = box.getBoundingClientRect();
      pointer.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      pointer.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    };
    window.addEventListener('pointermove', point, { passive: true });

    return () => {
      alive = false;
      control.current = null;
      near.disconnect();
      watch.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', point);
      gsap.ticker.remove(tick);
    };
  }, [reduced]);

  const seek = (i: number) => control.current?.seek(i);
  const toggle = () => {
    const on = !playing.current;
    playing.current = on;
    setPaused(!on);
    control.current?.play(on);
  };

  return { frameRef, canvasRef, fillsRef, moment, paused, failed, reduced, seek, toggle };
}
