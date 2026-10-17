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
