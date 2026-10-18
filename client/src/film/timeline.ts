/**
 * When each film caption is on screen, as film progress (0..1 of the film's scroll).
 * Shared by the film (film.ts, its scenes) and the hero's caption layer (Hero.tsx); kept
 * apart so the main bundle doesn't pull in the film itself.
 */
export const CAPTION_TIMES = {
  wait: [0.13, 0.27],
  monsoon: [0.3, 0.42],
  flight: [0.45, 0.535],
  drop: [0.55, 0.64],
  river: [0.72, 0.87],
} as const;

export type CaptionId = keyof typeof CAPTION_TIMES;

/**
 * The story's reel (section 06, film/StoryReel.tsx): the same film played by time, from the
 * wait to the river, then held on the river. Each moment runs the film from `f[0]` to `f[1]`
 * in `s` seconds; `still` is the film progress it shows without motion.
 */
export const REEL = [
  { id: 'wait', f: [0.13, 0.285], s: 5, still: 0.2 },
  { id: 'monsoon', f: [0.285, 0.44], s: 4.5, still: 0.38 },
  { id: 'flight', f: [0.44, 0.545], s: 3.5, still: 0.5 },
  { id: 'drop', f: [0.545, 0.66], s: 4, still: 0.58 },
  { id: 'river', f: [0.66, 0.88], s: 6, still: 0.8 },
] as const satisfies readonly {
  id: CaptionId;
  f: readonly [number, number];
  s: number;
  still: number;
}[];

/** The reel's length in seconds. */
export const REEL_LENGTH = REEL.reduce((sum, m) => sum + m.s, 0);

/** When moment `i` begins, in seconds. */
export const reelStart = (i: number) => REEL.slice(0, i).reduce((sum, m) => sum + m.s, 0);

/** The moment playing at `clock` seconds (the last one once the reel has ended). */
export function reelMoment(clock: number) {
  let t = clock;
  for (let i = 0; i < REEL.length; i++) {
    if (t < REEL[i].s) return i;
    t -= REEL[i].s;
  }
  return REEL.length - 1;
}

/** Film progress at `clock` seconds into the reel. */
export function reelAt(clock: number) {
  let t = Math.max(0, clock);
  for (const m of REEL) {
    if (t < m.s) return m.f[0] + ((m.f[1] - m.f[0]) * t) / m.s;
    t -= m.s;
  }
  return REEL[REEL.length - 1].f[1];
}
