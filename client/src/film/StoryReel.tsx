import { useEffect, useRef, useState } from 'react';
import { story } from '../content/copy';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { REEL, REEL_LENGTH, reelAt, reelMoment, reelStart } from './timeline';
import type { Film } from './film';

/** The frame's sky until the film draws: the forest's morning light. */
const GROUND = 'linear-gradient(180deg, #e7ecee, #eef1f2)';
/** The moment shown without motion: the catch. */
const STILL = 3;
/** Seconds a jump to another moment takes to dissolve. */
const DISSOLVE = 0.6;
/** How much of the frame must be on screen before the story starts. */
const START_AT = 0.4;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

interface Control {
  seek: (i: number) => void;
  play: (on: boolean) => void;
}

/**
 * The Chatak story as a short film (section 06): the hero film's story, played by time from
 * the wait to the river once the frame is well in view, then held on the river (which keeps
 * living). Under it, five moments to jump to, and a pause button. The film module and its
 * layers load as the frame nears the screen, and it draws on the GSAP ticker only while on
 * screen. Reduced motion: one still frame (the catch), and the moments show their stills.
 * The canvas is decorative; the figure's caption describes the film.
 */
export function StoryReel() {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const control = useRef<Control | null>(null);
  const playing = useRef(true);
  const reduced = useReducedMotion();
  const [moment, setMoment] = useState(() => (reduced ? STILL : 0));
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = canvas.current!;
    const box = frame.current!;
    const pointer = { x: 0, y: 0 };
    let film: Film | null = null;
    let alive = true;
    let visible = false;
    let armed = false; // the story's clock runs once the frame is well in view
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
      const dpr = Math.min(window.devicePixelRatio || 1, r.width > 900 ? 1.25 : 1.5);
      film.resize(r.width, r.height, dpr);
      dirty = true;
    };

    const progress = () => {
      const now = reduced ? still : reelMoment(clock);
      REEL.forEach((m, i) => {
        const k = reduced ? (i <= still ? 1 : 0) : clamp01((clock - reelStart(i)) / m.s);
        const fill = fills.current[i];
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
        .catch(() => alive && setFailed(true)); // the frame keeps its sky; no controls
    };

    // load as the frame nears the screen; start the story once it is well in view, and
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

    const point = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = box.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const leave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    box.addEventListener('pointermove', point, { passive: true });
    box.addEventListener('pointerleave', leave);

    return () => {
      alive = false;
      control.current = null;
      near.disconnect();
      watch.disconnect();
      ro.disconnect();
      box.removeEventListener('pointermove', point);
      box.removeEventListener('pointerleave', leave);
      gsap.ticker.remove(tick);
    };
  }, [reduced]);

  const toggle = () => {
    const on = !playing.current;
    playing.current = on;
    setPaused(!on);
    control.current?.play(on);
  };
  const active = moment;

  return (
    <div>
      <div
        ref={frame}
        className="relative aspect-[4/5] overflow-hidden md:aspect-[3/2]"
        style={{ background: GROUND }}
      >
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 data-ready:opacity-100"
        />
      </div>

      {!failed && (
        <div className="mt-3 flex items-start gap-4">
          {!reduced && (
            <button
              type="button"
              onClick={toggle}
              aria-label={paused ? story.reel.play : story.reel.pause}
              className="mt-1 grid h-10 w-10 shrink-0 cursor-pointer place-items-center border border-aluminium text-ink transition-colors duration-300 hover:border-ink"
            >
              <svg
                viewBox="0 0 12 12"
                width="12"
                height="12"
                aria-hidden="true"
                fill="currentColor"
              >
                {paused ? (
                  <path d="M3 1.5v9l7.5-4.5z" />
                ) : (
                  <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />
                )}
              </svg>
            </button>
          )}
          <ol aria-label={story.reel.label} className="grid flex-1 grid-cols-5 gap-2">
            {REEL.map((m, i) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => control.current?.seek(i)}
                  aria-current={i === active ? 'step' : undefined}
                  className="group block w-full cursor-pointer py-3 text-left"
                >
                  <span className="relative block h-0.5 overflow-hidden bg-aluminium">
                    <span
                      ref={(el) => {
                        fills.current[i] = el;
                      }}
                      className="absolute inset-0 origin-left bg-ink [transform:scaleX(0)]"
                    />
                  </span>
                  <span
                    className={`mt-3 hidden text-sm leading-snug transition-colors duration-300 md:block ${
                      i === active ? 'text-ink' : 'text-slate group-hover:text-ink'
                    }`}
                  >
                    {story.reel.moments[m.id]}
                  </span>
                  <span className="sr-only md:hidden">{story.reel.moments[m.id]}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
      {!failed && (
        <p aria-hidden="true" className="text-sm text-ink md:hidden">
          {story.reel.moments[REEL[active].id]}
        </p>
      )}
    </div>
  );
}
