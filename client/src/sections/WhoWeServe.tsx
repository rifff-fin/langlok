import { useId } from 'react';
import { whoWeServe } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';

type Segment = (typeof whoWeServe.segments)[number];
type PartnerId = keyof typeof whoWeServe.partners;

/** The partners' pictures (scripts/build-partners.py) and their intrinsic sizes. */
const PARTNER_IMG: Record<PartnerId, { can: [number, number]; logo: [number, number] }> = {
  'six-seasons': { can: [339, 900], logo: [640, 588] },
  'gulf-toledo': { can: [325, 900], logo: [640, 502] },
};
const src = (id: PartnerId, kind: 'can' | 'logo') => `/img/partners/${id}-${kind}.webp`;

/** The feature panels' ground: deep olive, with a soft light behind the can. */
const FEATURE_GROUND =
  'radial-gradient(42% 60% at 24% 58%, rgb(247 246 234 / 0.12) 0%, transparent 72%),' +
  'linear-gradient(160deg, color-mix(in oklab, var(--paper) 55%, transparent), color-mix(in oklab, var(--paper) 92%, transparent))';

const number = (seg: Segment) => String(whoWeServe.segments.indexOf(seg) + 1).padStart(2, '0');

/**
 * 10 Who we serve. The segments where we already make a partner's cans (hotels: Six Seasons;
 * food franchises: Gulf Toledo) are large panels: the partner's can standing on the left, the
 * segment and the partner's logo ("Already working with", on a white tile) on the right. The
 * other segments follow as slim cards with a plain can and a logo slot.
 */
export function WhoWeServe() {
  const featured = whoWeServe.segments.filter((s) => 'partner' in s);
  const others = whoWeServe.segments.filter((s) => !('partner' in s));
  return (
    <section aria-labelledby="serve-title" className="pb-[var(--section-y)]">
      <Container>
        <ChapterHead n={whoWeServe.chapter} label={whoWeServe.eyebrow} />
        <h2 id="serve-title" className="mt-12 max-w-[16ch] text-[length:var(--text-h2)]">
          <Emph text={whoWeServe.title} />
        </h2>

        <ul data-reveal="stagger" className="mt-16 grid gap-[var(--grid-gap)] lg:grid-cols-2">
          {featured.map(
            (seg) =>
              'partner' in seg && <FeatureCard key={seg.id} seg={seg} partner={seg.partner} />,
          )}
        </ul>

        <ul
          data-reveal="stagger"
          className="mt-[var(--grid-gap)] grid gap-[var(--grid-gap)] sm:grid-cols-2"
        >
          {others.map((seg) => (
            <li
              key={seg.id}
              className="flex items-center gap-6 border border-aluminium p-6 md:gap-8 md:p-8"
            >
              <CanSilhouette />
              <div>
                <span className="eyebrow tabular-nums text-slate">{number(seg)}</span>
                <h3 className="mt-2 text-[length:var(--text-h3)]">{seg.title}</h3>
                <p className="mt-1 text-slate">{seg.line}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function FeatureCard({ seg, partner }: { seg: Segment; partner: PartnerId }) {
  const p = whoWeServe.partners[partner];
  const img = PARTNER_IMG[partner];
  return (
    <li
      className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] overflow-hidden border border-aluminium"
      style={{ background: FEATURE_GROUND }}
    >
      {/* the can, standing on a soft pool of shadow */}
      <div className="relative flex items-end justify-center px-3 pt-10 pb-8 md:pt-12 md:pb-10">
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 h-5 w-[62%] -translate-x-1/2 rounded-[50%] bg-black/40 blur-md md:bottom-8"
        />
        <img
          src={src(partner, 'can')}
          alt={p.canAlt}
          width={img.can[0]}
          height={img.can[1]}
          loading="lazy"
          decoding="async"
          className="relative h-[clamp(14rem,24vw,22rem)] w-auto max-w-full object-contain"
        />
      </div>

      <div className="flex flex-col justify-between gap-8 py-8 pr-6 pl-2 md:py-10 md:pr-10">
        <div>
          <span className="eyebrow tabular-nums text-slate">{number(seg)}</span>
          <h3 className="mt-3 text-[length:var(--text-h3)]">{seg.title}</h3>
          <p className="mt-2 max-w-[26ch] text-slate">{seg.line}</p>
        </div>
        <div>
          <p className="eyebrow text-rain-deep">{whoWeServe.partnersLabel}</p>
          <div className="mt-3 inline-flex h-20 max-w-full items-center rounded-xl bg-white px-4 py-2 md:h-24 md:px-5">
            <img
              src={src(partner, 'logo')}
              alt={p.logoAlt}
              width={img.logo[0]}
              height={img.logo[1]}
              loading="lazy"
              decoding="async"
              className="h-full w-auto max-w-full object-contain"
            />
          </div>
        </div>
      </div>
    </li>
  );
}

function CanSilhouette() {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 60 120" className="h-24 w-auto shrink-0 md:h-28" aria-hidden="true">
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
