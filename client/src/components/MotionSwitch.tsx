import { motionSwitch } from '../content/copy';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { setMotion } from '../lib/motion';

/**
 * Bottom-corner switch for the scroll animation. It starts from the OS setting
 * (prefers-reduced-motion) and lets visitors choose either way; the choice is remembered
 * in this browser and the page rebuilds with it (lib/motion.ts).
 */
export function MotionSwitch() {
  const reduced = useReducedMotion();
  return (
    <button
      type="button"
      data-motion-toggle
      aria-pressed={!reduced}
      title={motionSwitch.title}
      onClick={() => setMotion(!reduced)}
      className="eyebrow fixed right-3 bottom-3 z-40 inline-flex h-10 items-center gap-3 border border-aluminium bg-paper/95 px-4 text-ink transition-colors duration-[var(--dur-ui)] ease-liquid hover:border-ink md:right-6 md:bottom-6"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${reduced ? 'bg-aluminium' : 'bg-rain'}`}
      />
      {motionSwitch.label}
      <span aria-hidden="true" className="text-slate">
        {reduced ? motionSwitch.off : motionSwitch.on}
      </span>
    </button>
  );
}
