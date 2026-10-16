import { useId } from 'react';
import { whoWeServe } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';

/** Tint per segment; photography arrives with the client assets. TODO(client): photos. */
const TINTS: Record<(typeof whoWeServe.segments)[number]['id'], string> = {
  hotel: 'linear-gradient(180deg, var(--paper), var(--cloud))',
  franchise:
    'linear-gradient(180deg, var(--cloud), color-mix(in oklab, var(--rain-light) 30%, var(--cloud)))',
  event:
    'linear-gradient(180deg, var(--paper), color-mix(in oklab, var(--leaf) 16%, var(--cloud)))',
  venue:
    'linear-gradient(180deg, var(--cloud), color-mix(in oklab, var(--aluminium) 70%, var(--cloud)))',
};

/**
 * 10 Who we serve. Four tall cards; each shows a plain can with a placeholder partner
 * logo slot. Phase 5 renders branded cans from the 3D scene and adds hover tilt.
 */
export function WhoWeServe() {
  return (
    <section aria-labelledby="serve-title" className="pb-[var(--section-y)]">
      <Container>
        <ChapterHead n={whoWeServe.chapter} label={whoWeServe.eyebrow} />
        <h2 id="serve-title" className="mt-12 max-w-[16ch] text-[length:var(--text-h2)]">
          {whoWeServe.title}
        </h2>

        <ul
          data-reveal="stagger"
          className="mt-16 grid grid-cols-1 gap-[var(--grid-gap)] sm:grid-cols-2 lg:grid-cols-4"
        >
          {whoWeServe.segments.map((seg, i) => (
            <li
              key={seg.id}
              className="flex aspect-[3/4] flex-col justify-between border border-aluminium p-7"
              style={{ background: TINTS[seg.id] }}
            >
              <span className="eyebrow tabular-nums text-slate">
                {String(i + 1).padStart(2, '0')}
              </span>
              <CanSilhouette />
              <div className="min-h-[7.5rem]">
                <h3 className="text-[length:var(--text-h3)]">{seg.title}</h3>
                <p className="mt-2 text-slate">{seg.line}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function CanSilhouette() {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 60 120" className="mx-auto h-[38%] w-auto" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1">
          <stop offset="0" stopColor="#b9c0c6" />
          <stop offset="0.35" stopColor="#f4f6f7" />
          <stop offset="0.6" stopColor="#d3d8dc" />
          <stop offset="1" stopColor="#aeb5bb" />
        </linearGradient>
      </defs>
      <path
        d="M12 4h36l4 6v100l-4 6H12l-4-6V10z"
        fill={`url(#${gradientId})`}
        stroke="var(--aluminium)"
      />
      <rect
        x="17"
        y="44"
        width="26"
        height="22"
        fill="none"
        stroke="var(--ink)"
        strokeOpacity="0.4"
        strokeDasharray="2 2"
      />
    </svg>
  );
}
