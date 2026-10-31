import { useEffect, useRef, useState, type RefObject } from 'react';
import { hero } from '../content/copy';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { whenRevealed } from '../lib/preloader';
import { playFilm, toggleSound } from '../lib/video';

/** Web versions of the film (made from the master with ffmpeg; see docs/STATUS.md). */
const SRC = { wide: '/video/hero-1080.mp4', narrow: '/video/hero-720.mp4' };
const POSTER = '/video/hero-poster.webp';

/**
 * The hero film after the can opens: a full-screen video in the hero's sky layer. Hero.tsx
 * plays and pauses it with the scroll (it starts as the dive ends, muted, so browsers allow
 * it); HeroVideoControls is the sound switch, the progress line and "watch again". Phones
 * get the 720p file. Decorative to screen readers: the controls carry the description.
 */
export function HeroVideo({ video }: { video: RefObject<HTMLVideoElement | null> }) {
  const [src] = useState(() => (window.innerWidth < 900 ? SRC.narrow : SRC.wide));

  // fetch the start of the film once the opening screen is up, not under the preloader
  useEffect(() => {
    let cancelled = false;
    whenRevealed(() => {
      const start = () => {
        const v = video.current;
        if (!cancelled && v && v.preload !== 'auto') v.preload = 'auto';
      };
      if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 3000 });
      else setTimeout(start, 1500);
    });
    return () => {
      cancelled = true;
    };
  }, [video]);

  return (
    <video
      ref={video}
      src={src}
      poster={POSTER}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full bg-olive-deep object-cover"
    />
  );
}

const btn =
  'eyebrow pointer-events-auto inline-flex h-11 cursor-pointer items-center gap-3 border border-cream/40 bg-olive-deep/75 px-4 text-cream transition-colors duration-300 hover:bg-olive-deep';

/** The sound switch, a progress line along the bottom of the screen, and "watch again". */
export function HeroVideoControls({ video }: { video: RefObject<HTMLVideoElement | null> }) {
  const reduced = useReducedMotion();
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let raf = 0;
    const draw = () => {
      if (bar.current && v.duration)
        bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
      raf = v.paused ? 0 : requestAnimationFrame(draw);
    };
    const onPlay = () => {
      setPlaying(true);
      setEnded(false);
      raf ||= requestAnimationFrame(draw);
    };
    const onPause = () => {
      setPlaying(false);
      draw();
    };
    const onEnded = () => setEnded(true);
    const onVolume = () => setMuted(v.muted);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    v.addEventListener('volumechange', onVolume);
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('volumechange', onVolume);
    };
  }, [video]);

  return (
    <>
      <p className="sr-only">{hero.video.description}</p>
      {/* the film's progress, a hairline along the foot of the screen */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-cream/25">
        <span ref={bar} className="absolute inset-0 origin-left bg-lime [transform:scaleX(0)]" />
      </span>

      <div className="absolute right-[var(--gutter)] bottom-6 flex gap-2 md:bottom-8">
        {(ended || (reduced && !playing)) && (
          <button
            type="button"
            className={btn}
            onClick={() => playFilm(video.current, { restart: true })}
          >
            <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" fill="currentColor">
              <path d="M3 1.5v9l7.5-4.5z" />
            </svg>
            {ended ? hero.video.replay : hero.video.play}
          </button>
        )}
        <button type="button" className={btn} onClick={() => toggleSound(video.current)}>
          <svg
            viewBox="0 0 20 20"
            width="16"
            height="16"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M3 8h3l4-3.5v11L6 12H3z" fill="currentColor" stroke="none" />
            {muted ? (
              <path d="M13.5 7.5l4 5M17.5 7.5l-4 5" />
            ) : (
              <path d="M13.5 7a4 4 0 0 1 0 6M15.8 5a7 7 0 0 1 0 10" />
            )}
          </svg>
          {muted ? hero.video.soundOff : hero.video.soundOn}
        </button>
      </div>
    </>
  );
}
