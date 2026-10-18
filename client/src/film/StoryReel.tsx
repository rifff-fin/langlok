import { story } from '../content/copy';
import { REEL } from './timeline';
import type { useStoryReel } from './useStoryReel';

/** The film's sky until it draws: the forest's morning light. */
const GROUND = 'linear-gradient(180deg, #e7ecee, #eef1f2)';

type Reel = ReturnType<typeof useStoryReel>;

/** The film itself. Decorative to the eye, described for screen readers. */
export function ReelFilm({
  frameRef,
  canvasRef,
  className = '',
}: Pick<Reel, 'frameRef' | 'canvasRef'> & { className?: string }) {
  return (
    <div
      ref={frameRef}
      role="img"
      aria-label={story.reel.alt}
      className={`overflow-hidden ${className}`}
      style={{ background: GROUND }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 data-ready:opacity-100"
      />
    </div>
  );
}

/** The five moments to jump to (each fills as it plays, the current one named under them)
 *  and the pause button. */
export function ReelControls({
  fillsRef,
  moment,
  paused,
  failed,
  reduced,
  seek,
  toggle,
  className = '',
}: Omit<Reel, 'frameRef' | 'canvasRef'> & { className?: string }) {
  if (failed) return null;

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {!reduced && (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? story.reel.play : story.reel.pause}
          className="mt-1 grid h-10 w-10 shrink-0 cursor-pointer place-items-center border border-aluminium text-ink transition-colors duration-300 hover:border-ink"
        >
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" fill="currentColor">
            {paused ? (
              <path d="M3 1.5v9l7.5-4.5z" />
            ) : (
              <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />
            )}
          </svg>
        </button>
      )}
      <div className="flex-1">
        <ol aria-label={story.reel.label} className="grid grid-cols-5 gap-2">
          {REEL.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => seek(i)}
                aria-current={i === moment ? 'step' : undefined}
                className="group block w-full cursor-pointer py-3"
              >
                <span className="relative block h-0.5 overflow-hidden bg-aluminium transition-colors duration-300 group-hover:bg-slate">
                  <span
                    ref={(el) => {
                      fillsRef.current[i] = el;
                    }}
                    className="absolute inset-0 origin-left bg-ink [transform:scaleX(0)]"
                  />
                </span>
                <span className="sr-only">{story.reel.moments[m.id]}</span>
              </button>
            </li>
          ))}
        </ol>
        <p aria-hidden="true" className="text-sm text-ink">
          <span className="tabular-nums text-slate">
            {String(moment + 1).padStart(2, '0')} / {String(REEL.length).padStart(2, '0')}
          </span>
          <span className="mx-2 text-slate">·</span>
          {story.reel.moments[REEL[moment].id]}
        </p>
      </div>
    </div>
  );
}
