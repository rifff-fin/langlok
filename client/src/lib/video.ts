/** Play a film from where it is; from the start if it had ended. Autoplay can be refused
 *  (data saver, low power): the controls then offer a play button. */
export function playFilm(v: HTMLVideoElement | null, { restart = false } = {}) {
  if (!v) return;
  if (restart && v.ended) v.currentTime = 0;
  void v.play().catch(() => undefined);
}

/** Sound on or off; turning it on also plays the film if it is paused. */
export function toggleSound(v: HTMLVideoElement | null) {
  if (!v) return;
  v.muted = !v.muted;
  if (!v.muted && v.paused) playFilm(v, { restart: true });
}
