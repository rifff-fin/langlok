import { hero, products } from '../content/copy';
import { Container } from '../components/ui/Container';
import { Eyebrow } from '../components/ui/Eyebrow';
import { ProductPlate } from '../components/ProductPlate';

/** Scroll distance of the film, in viewport heights (master plan §4.2: ~500vh). */
export const HERO_SCROLL_VH = 500;

/**
 * 01 Hero — "Sky to Seal".
 * Phase 1: static layout at its final height. A sticky full-viewport stage (CSS sky for
 * now) with the six text beats placed along the track at their scroll fractions.
 * Phase 2 mounts the frame canvas, poster, fog glass and GSAP beat reveals in the stage.
 */
export function Hero() {
  const [first, ...rest] = hero.beats;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative"
      style={{ height: `${HERO_SCROLL_VH + 100}svh` }}
    >
      <div
        data-hero-stage
        aria-hidden="true"
        className="sticky top-0 h-svh overflow-hidden"
        style={{
          background:
            'radial-gradient(120% 70% at 70% 8%, var(--paper) 0%, transparent 60%),' +
            'radial-gradient(90% 50% at 15% 95%, color-mix(in oklab, var(--leaf) 14%, transparent) 0%, transparent 70%),' +
            'linear-gradient(180deg, var(--cloud) 0%, var(--mist) 55%, color-mix(in oklab, var(--rain-light) 22%, var(--mist)) 100%)',
        }}
      ></div>

      <div className="absolute inset-0">
        {/* Beat A — the first screen */}
        <div className="absolute inset-x-0 top-0 flex h-svh items-end pb-[18svh] md:items-center md:pb-0">
          <Container>
            <Eyebrow className="text-slate">{hero.beatLabels[first.id]}</Eyebrow>
            <h1
              id="hero-title"
              className="mt-6 max-w-[12ch] text-[length:var(--text-display)] leading-[0.95] text-ink"
            >
              {first.title}
            </h1>
            <p className="mt-8 max-w-[34ch] text-slate md:text-lg">{first.sub}</p>
          </Container>
        </div>

        <div className="absolute inset-x-0 top-[calc(100svh-5.5rem)] flex justify-center">
          <span className="eyebrow flex flex-col items-center gap-3 text-slate">
            {hero.scrollHint}
            <span className="h-10 w-px bg-slate/50" aria-hidden="true" />
          </span>
        </div>

        {/* Beats B–F, placed where their scroll fraction will bring them on screen. */}
        {rest.map((beat) => {
          const isLast = beat.id === 'F';
          return (
            <div
              key={beat.id}
              className="absolute inset-x-0"
              style={{ top: `calc(${beat.at * HERO_SCROLL_VH}svh + 40svh)` }}
            >
              <Container className={isLast ? 'grid items-center gap-10 md:grid-cols-12' : ''}>
                <div
                  className={isLast ? 'md:col-span-6' : 'md:ml-[calc(100%/12*6)] md:max-w-[34rem]'}
                >
                  <Eyebrow className="text-slate">{hero.beatLabels[beat.id]}</Eyebrow>
                  <h2 className="mt-5 text-[length:var(--text-h2)] text-ink">{beat.title}</h2>
                  {beat.sub && <p className="mt-5 max-w-[34ch] text-slate">{beat.sub}</p>}
                </div>
                {isLast && (
                  // Stand-in for the 3D handoff can (Phase 3).
                  <ProductPlate
                    src="/img/mockups/can-front.jpeg"
                    alt={products.can.imageAlt}
                    width={579}
                    height={1024}
                    className="md:col-span-5 md:col-start-8"
                  />
                )}
              </Container>
            </div>
          );
        })}
      </div>
    </section>
  );
}
