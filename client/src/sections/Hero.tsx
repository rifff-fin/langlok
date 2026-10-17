import { lazy, Suspense, useRef } from 'react';
import { createPortal } from 'react-dom';
import { hero, products } from '../content/copy';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';
import { Eyebrow } from '../components/ui/Eyebrow';
import { VesselPlate } from '../components/VesselPlate';
import { gsap, useGSAP, type ScrollTrigger } from '../lib/gsap';
import { motionQuery, reducedQuery } from '../lib/motion';
import { registerSpin } from '../store/scene';
import { CAPTION_TIMES } from '../film/timeline';

// The living film (its own chunk; layers fetched at idle).
const HeroFilm = lazy(() => import('../film/HeroFilm'));

/** Scroll distance of the film, in viewport heights (master plan §4.2: ~500vh). */
export const HERO_SCROLL_VH = 500;
/** How long the opening screen holds while the can dives, in viewport heights. */
const DIVE_VH = 90;

/**
 * 01 Hero.
 * Opening screen: the live 3D can, centred, between the headline and a serif aside (the
 * Morpho reference). Scrolling holds the screen while the can tips its lid to the camera,
 * the tab clicks open and the camera dives into the opening. The sky stage takes over with
 * the film (film/: the Chatak waits in the forest, monsoon clouds roll in, he catches the
 * first drop, the rain becomes a river in the mist), its captions shown one at a time on a
 * sticky layer. The vessel beat's plate is where the can comes back: the film ends in mist,
 * the stage fades to the mist page and the can stands there, then glides on to the products.
 * Reduced motion: no hold and no dive; the opening screen scrolls away under the sky and
 * the film's scenes only crossfade.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const film = useRef<ScrollTrigger | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: motionQuery(), reduced: reducedQuery() }, (ctx) => {
        const q = gsap.utils.selector(section);
        const reduced = ctx.conditions!.reduced;
        // The film runs from the end of the dive until the vessel beat starts to arrive. Its
        // captions ride the same trigger, one at a time (windows in film/timeline.ts).
        // Opacity only, not visibility: hidden captions stay readable to screen readers.
        const captions = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section.current,
            start: () => window.innerHeight * (reduced ? 0.55 : DIVE_VH / 100),
            endTrigger: q('[data-beat="vessel"]')[0],
            end: 'top bottom',
            scrub: reduced ? true : 0.5,
          },
        });
        for (const el of q('[data-caption]')) {
          const [from, to] = CAPTION_TIMES[el.dataset.caption as keyof typeof CAPTION_TIMES];
          const lift = reduced ? 0 : 28;
          captions
            .fromTo(
              el,
              { opacity: 0, y: lift },
              { opacity: 1, y: 0, duration: 0.035, ease: 'power2.out' },
              from,
            )
            .to(el, { opacity: 0, y: -lift, duration: 0.03, ease: 'power2.in' }, to - 0.03);
        }
        captions.set({}, {}, 1); // the timeline spans the whole film: progress = film progress
        film.current = captions.scrollTrigger ?? null;
        // One tween per element: the sky layer comes up as the opening screen ends, and its
        // stage leaves again as beat F arrives (uncovering the can on the mist page). Two
        // scrubbed tweens on one element would fight after a jump (e.g. a nav link).
        const sky = q('[data-hero-sky]')[0];
        gsap.fromTo(
          stage.current,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: q('[data-beat="vessel"]')[0],
              start: 'top bottom',
              end: 'top 40%',
              scrub: true,
            },
          },
        );

        if (reduced) {
          // no dive: the sky simply comes up as the opening screen scrolls away
          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: section.current,
                start: 'top top',
                end: '+=70%',
                scrub: true,
              },
            })
            .fromTo(sky, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
            .to(backdrop.current, { autoAlpha: 0 }, 0);
          return () => {
            film.current = null;
          };
        }

        gsap.set(intro.current, { height: `${100 + DIVE_VH}svh` }); // hold the opening screen
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: `+=${DIVE_VH}%`,
            scrub: 0.5,
          },
        });
        tl.to(q('[data-intro-copy]'), { autoAlpha: 0, y: -48, stagger: 0.03, duration: 0.24 }, 0)
          .fromTo(
            q('[data-dive-copy]'),
            { autoAlpha: 0, y: 36 },
            { autoAlpha: 1, y: 0, duration: 0.16, ease: 'power2.out' },
            0.34,
          )
          .to(q('[data-dive-copy]'), { autoAlpha: 0, y: -28, duration: 0.12 }, 0.72)
          .fromTo(sky, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16 }, 0.84)
          .to(backdrop.current, { autoAlpha: 0, duration: 0.16 }, 0.84);
        // the 3D reads the trigger's raw progress and damps it itself
        registerSpin('heroDive', tl.scrollTrigger);
        return () => {
          registerSpin('heroDive', null);
          film.current = null;
        };
      });
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className="relative"
      style={{ height: `${HERO_SCROLL_VH + 100}svh` }}
    >
      {/* Soft studio light behind the opening can: below the canvas, so outside main. */}
      {createPortal(
        <div
          ref={backdrop}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              'radial-gradient(34% 46% at 50% 54%, #ffffff 0%, rgb(255 255 255 / 0) 72%),' +
              'radial-gradient(90% 55% at 50% 108%, color-mix(in oklab, var(--rain-light) 30%, transparent) 0%, transparent 70%),' +
              'linear-gradient(180deg, var(--cloud) 0%, var(--mist) 46%)',
          }}
        />,
        document.body,
      )}

      {/* The sky stage: the film. Its sky layer is clear during the opening screen (a CSS
          sky until the film's layers load); the stage itself fades out at beat F. */}
      <div
        ref={stage}
        data-hero-stage
        aria-hidden="true"
        className="sticky top-0 h-svh overflow-hidden"
      >
        <div
          data-hero-sky
          className="invisible absolute inset-0 opacity-0"
          style={{
            background:
              'radial-gradient(120% 70% at 70% 8%, var(--paper) 0%, transparent 60%),' +
              'radial-gradient(90% 50% at 15% 95%, color-mix(in oklab, var(--leaf) 14%, transparent) 0%, transparent 70%),' +
              'linear-gradient(180deg, var(--cloud) 0%, var(--mist) 55%, color-mix(in oklab, var(--rain-light) 22%, var(--mist)) 100%)',
          }}
        >
          <Suspense fallback={null}>
            <HeroFilm trigger={film} />
          </Suspense>
        </div>
      </div>

      <div className="absolute inset-0">
        {/* The opening screen. With motion it holds (sticky) while the can dives. */}
        <div ref={intro} className="absolute inset-x-0 top-0 h-svh">
          <div className="sticky top-0 h-svh">
            <Container className="grid h-full grid-cols-4 grid-rows-[auto_minmax(0,1fr)] gap-x-[var(--grid-gap)] pt-[calc(var(--header-h)+2rem)] pb-16 md:grid-cols-12 md:grid-rows-1 md:items-center md:py-0">
              <div
                data-intro-copy
                className="col-span-4 md:col-span-5 md:pt-[var(--header-h)] lg:col-span-4"
              >
                <Eyebrow className="text-slate">{hero.intro.eyebrow}</Eyebrow>
                <h1
                  id="hero-title"
                  data-reveal="intro"
                  className="mt-5 text-[length:var(--text-hero)] leading-[1] text-ink md:mt-7"
                >
                  <Emph text={hero.intro.title} />
                </h1>
                <p className="mt-5 max-w-[30ch] text-slate md:mt-7">{hero.intro.sub}</p>
              </div>

              <div className="col-span-4 flex min-h-0 items-center justify-center pt-6 [--plate-h:100%] md:col-span-4 md:col-start-5 md:h-full md:pt-[var(--header-h)] md:[--plate-h:min(70svh,640px)] lg:col-start-5">
                <VesselPlate
                  vessel="can"
                  anchor="hero-intro"
                  alt={hero.intro.canAlt}
                  height="var(--plate-h)"
                  priority
                />
              </div>

              <div
                data-intro-copy
                className="hidden md:col-span-3 md:col-start-10 md:block md:pt-[var(--header-h)] md:text-right"
              >
                <p className="headline text-[length:var(--text-h3)] text-ink">
                  <Emph text={hero.intro.aside} />
                </p>
                <ul className="mt-6 space-y-2 text-slate">
                  {hero.intro.asideLines.map((line) => (
                    <li key={line} className="eyebrow">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Container>

            {/* The dive's caption, over the lid as it comes up. */}
            <div
              data-dive-copy
              aria-hidden="true"
              className="invisible absolute inset-x-0 top-[calc(var(--header-h)+1.75rem)] opacity-0 md:top-1/2 md:-translate-y-1/2"
            >
              <Container>
                <Eyebrow className="text-slate">{hero.dive.eyebrow}</Eyebrow>
                <p className="headline mt-4 max-w-[12ch] text-[length:var(--text-h2)] text-ink">
                  <Emph text={hero.dive.title} />
                </p>
              </Container>
            </div>

            <div
              data-intro-copy
              className="absolute inset-x-0 bottom-5 flex justify-center md:bottom-8"
            >
              <span className="eyebrow flex flex-col items-center gap-3 text-slate">
                {hero.scrollHint}
                <span className="h-8 w-px bg-slate/50 md:h-10" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>

        {/* The film's captions: a sticky layer over the film's whole run, ending where the
            vessel beat begins. Right of the bird on wide screens, under it on phones. */}
        <div
          className="pointer-events-none absolute inset-x-0"
          style={{
            top: `${DIVE_VH}svh`,
            height: `calc(${hero.vessel.at * HERO_SCROLL_VH}svh + 40svh - ${DIVE_VH}svh)`,
          }}
        >
          <div className="sticky top-0 h-svh">
            {hero.captions.map((c) => (
              <div
                key={c.id}
                data-caption={c.id}
                className="absolute inset-0 flex items-end pb-[11svh] opacity-0 md:items-center md:pb-0"
              >
                <Container className="md:grid md:grid-cols-12 md:gap-x-[var(--grid-gap)]">
                  <div className="md:col-span-5 md:col-start-8 md:pt-[var(--header-h)]">
                    <Eyebrow className="text-slate">{c.label}</Eyebrow>
                    <h2
                      data-reveal="off"
                      className="mt-4 text-[length:var(--text-h2)] text-ink md:mt-5"
                    >
                      <Emph text={c.title} />
                    </h2>
                    <p className="mt-4 max-w-[34ch] text-slate md:mt-5">{c.sub}</p>
                  </div>
                </Container>
              </div>
            ))}
          </div>
        </div>

        {/* The vessel beat: the film ends in mist and the can stands here again. */}
        <div
          data-beat="vessel"
          className="absolute inset-x-0"
          style={{ top: `calc(${hero.vessel.at * HERO_SCROLL_VH}svh + 40svh)` }}
        >
          <Container className="grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <Eyebrow className="text-slate">{hero.vessel.label}</Eyebrow>
              <h2 className="mt-5 text-[length:var(--text-h2)] text-ink">
                <Emph text={hero.vessel.title} />
              </h2>
              <p data-reveal="fade" className="mt-5 max-w-[34ch] text-slate">
                {hero.vessel.sub}
              </p>
            </div>
            <div className="flex justify-center md:col-span-5 md:col-start-8">
              <VesselPlate
                vessel="can"
                anchor="hero-can"
                alt={products.can.imageAlt}
                height="min(64svh, 150vw)"
              />
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
