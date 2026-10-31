import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { hero, products } from '../content/copy';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';
import { Eyebrow } from '../components/ui/Eyebrow';
import { VesselPlate } from '../components/VesselPlate';
import { HeroVideo, HeroVideoControls } from '../components/HeroVideo';
import { playFilm } from '../lib/video';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { motionQuery, reducedQuery } from '../lib/motion';
import { registerSpin } from '../store/scene';
import spec from '../three/vesselSpec.json';

/** Scroll distance of the hero, in viewport heights: the dive, about one screen of film
 *  (it plays by time, so this is how long it holds the screen), and the vessel beat. */
export const HERO_SCROLL_VH = 280;
/** How long the opening screen holds while the can dives, in viewport heights. */
const DIVE_VH = 90;
/** The can's plate height against the bottle's, so the two stand at their true sizes. */
const CAN_TO_BOTTLE = spec.can.frame.h / spec.bottle.frame.h;

/**
 * 01 Hero.
 * Opening screen: the live 3D can, centred, between the headline and a serif aside (the
 * Morpho reference). Scrolling holds the screen while the can tips its lid to the camera,
 * the tab clicks open and the camera dives into the opening. The film opens out of the
 * opening (a circle growing from the centre of the screen) and plays: a full-screen video,
 * muted, with a sound switch (components/HeroVideo.tsx). It plays while its stretch of the
 * page is on screen and pauses when you scroll away. The vessel beat's plate is where the can
 * comes back: the stage fades to the page and the can stands there beside the bottle, at
 * their true sizes; then the can glides on to the products (the bottle meets it there later). Reduced motion: no hold and no dive; the opening screen scrolls away under the
 * film, which waits for its play button.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: motionQuery(), reduced: reducedQuery() }, (ctx) => {
        const q = gsap.utils.selector(section);
        const reduced = ctx.conditions!.reduced;
        // The film's stretch: from the end of the dive until the vessel beat starts to arrive.
        // Coming down into it the film plays (from the start if it had ended), coming back up
        // into it, it resumes; leaving pauses it. With reduced motion it waits for its button.
        const pause = () => video.current?.pause();
        ScrollTrigger.create({
          trigger: section.current,
          start: () => window.innerHeight * (reduced ? 0.55 : DIVE_VH / 100),
          endTrigger: q('[data-beat="vessel"]')[0],
          end: 'top bottom',
          onEnter: () => !reduced && playFilm(video.current, { restart: true }),
          onEnterBack: () => !reduced && playFilm(video.current),
          onLeave: pause,
          onLeaveBack: pause,
        });
        // One tween per element: the sky layer comes up as the opening screen ends, and its
        // stage leaves again as beat F arrives (uncovering the can on the mist page), and the
        // film's controls with it. Two scrubbed tweens on one element would fight after a jump
        // (e.g. a nav link).
        const sky = q('[data-hero-sky]')[0];
        gsap.fromTo(
          [stage.current, controls.current],
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
          return;
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
          // the film opens out of the can's mouth: a circle from the centre of the screen
          .set(sky, { autoAlpha: 1 }, 0.78)
          .fromTo(
            sky,
            { clipPath: 'circle(3% at 50% 50%)' },
            { clipPath: 'circle(80% at 50% 50%)', duration: 0.22, ease: 'power2.in' },
            0.78,
          )
          .to(backdrop.current, { autoAlpha: 0, duration: 0.16 }, 0.84);
        // the 3D reads the trigger's raw progress and damps it itself
        registerSpin('heroDive', tl.scrollTrigger);
        return () => {
          registerSpin('heroDive', null);
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
          className="hero-ground pointer-events-none fixed inset-0 -z-10"
        >
          {/* the layers (globals.css): the sweep and its light, rain rings on the floor round
              the can's base, and the brand's name, faint, low and to the left */}
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="hero-rings absolute">
            {[130, 240, 370].map((r, i) => (
              <ellipse
                key={r}
                cx="500"
                cy="100"
                rx={r}
                ry={r * 0.2}
                fill="none"
                stroke="var(--ink)"
                strokeOpacity={0.16 - i * 0.045}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <span className="hero-word absolute">{hero.intro.backWord}</span>
        </div>,
        document.body,
      )}

      {/* The sky stage: the film. Its sky layer is clear during the opening screen and opens
          out of the can's mouth as the dive ends; the stage itself fades out at beat F. */}
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
          <HeroVideo video={video} />
        </div>
      </div>

      <div className="absolute inset-0">
        {/* The opening screen. With motion it holds (sticky) while the can dives. */}
        <div ref={intro} className="absolute inset-x-0 top-0 h-svh">
          <div className="sticky top-0 h-svh">
            <Container className="grid h-full grid-cols-4 grid-rows-[auto_minmax(0,1fr)] gap-x-[var(--grid-gap)] pt-[calc(var(--header-h)+2rem)] pb-16 md:grid-cols-12 md:grid-rows-1 md:items-center md:py-0 lg:px-[calc(var(--gutter)*0.6)]">
              <div
                data-intro-copy
                className="col-span-4 md:col-span-5 md:pt-[var(--header-h)] lg:col-span-4"
              >
                <Eyebrow className="text-ink">{hero.intro.eyebrow}</Eyebrow>
                <h1
                  id="hero-title"
                  data-reveal="intro"
                  className="mt-5 font-display text-[length:var(--text-hero)] leading-[1] font-normal tracking-[-0.03em] text-ink md:mt-7"
                >
                  <Emph text={hero.intro.title} />
                </h1>
                <p className="mt-5 max-w-[28ch] text-ink md:mt-7">{hero.intro.sub}</p>
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
                <ul className="mt-6 space-y-2 text-ink">
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
                <Eyebrow className="text-ink">{hero.dive.eyebrow}</Eyebrow>
                <p className="headline mt-4 max-w-[12ch] text-[length:var(--text-h2)] text-ink">
                  <Emph text={hero.dive.title} />
                </p>
              </Container>
            </div>

            <div
              data-intro-copy
              className="absolute inset-x-0 bottom-5 flex justify-center md:bottom-8"
            >
              <span className="eyebrow flex flex-col items-center gap-3 text-ink">
                {hero.scrollHint}
                <span className="h-8 w-px bg-ink/50 md:h-10" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>

        {/* The film's controls: a sticky layer over the film's stretch, ending where the
            vessel beat begins (above the stage, so its buttons take clicks). */}
        <div
          className="pointer-events-none absolute inset-x-0"
          style={{
            top: `${DIVE_VH}svh`,
            height: `calc(${hero.vessel.at * HERO_SCROLL_VH}svh + 40svh - ${DIVE_VH}svh)`,
          }}
        >
          <div ref={controls} className="sticky top-0 h-svh">
            <HeroVideoControls video={video} />
          </div>
        </div>

        {/* The vessel beat: the stage fades to the page; the bottle and the can stand here. */}
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
            <div className="flex items-end justify-center [--bh:min(66svh,100vw)] md:col-span-5 md:col-start-8 md:[--bh:min(66svh,46vw)]">
              <VesselPlate
                vessel="bottle"
                anchor="hero-bottle"
                alt={products.bottle.imageAlt}
                height="var(--bh)"
              />
              <VesselPlate
                vessel="can"
                anchor="hero-can"
                alt={products.can.imageAlt}
                height={`calc(var(--bh) * ${CAN_TO_BOTTLE.toFixed(4)})`}
              />
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
