import { useRef } from 'react';
import { yourLogo } from '../content/copy';
import { Button } from '../components/ui/Button';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';
import { VesselPlate } from '../components/VesselPlate';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { motionQuery, reducedQuery } from '../lib/motion';
import { registerSpin } from '../store/scene';
import spec from '../three/vesselSpec.json';

/**
 * 04 Your Logo Here. Both live vessels stand side by side at true relative size; one more
 * full turn with scroll, and the label switches to YOUR LOGO HERE while the print faces
 * away, so each vessel comes round already rebranded. The stills (rebranded) are the
 * no-WebGL version.
 */
export function YourLogo() {
  const section = useRef<HTMLElement>(null);
  const pair = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: motionQuery('(min-width: 768px)'),
          phone: motionQuery('(max-width: 767.98px)'),
          reduced: reducedQuery(),
        },
        (ctx) => {
          const st = ctx.conditions!.desktop
            ? ScrollTrigger.create({
                trigger: section.current,
                start: 'top top',
                end: '+=100%',
                pin: true,
                anticipatePin: 1,
              })
            : // no pin: the turn (and swap) completes as the pair reaches the centre
              ScrollTrigger.create({
                trigger: pair.current,
                start: 'top bottom',
                end: 'center center',
              });
          registerSpin('logo', st);
          return () => registerSpin('logo', null);
        },
      );
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      aria-labelledby="your-logo-title"
      className="relative flex min-h-svh flex-col justify-center py-24"
    >
      {/* On desktop the chapter head sits out of flow at the top, so the pair is centred in
          the pinned screen and the bottle lands exactly where its glide ends. */}
      <Container className="md:absolute md:inset-x-0 md:top-24">
        <ChapterHead n={yourLogo.chapter} label={yourLogo.eyebrow} />
      </Container>

      <Container>
        <div className="mt-12 grid grid-cols-4 items-center gap-x-[var(--grid-gap)] gap-y-12 md:mt-0 md:grid-cols-12">
          <div className="col-span-4 md:col-span-5">
            <h2 id="your-logo-title" className="text-[length:var(--text-h2)]">
              <Emph text={yourLogo.title} />
            </h2>
            <p data-reveal="fade" className="mt-6 max-w-[34ch] text-slate">
              {yourLogo.sub}
            </p>
            <Button href={yourLogo.cta.href} className="mt-10">
              {yourLogo.cta.label}
            </Button>
          </div>

          {/* Bottle sets the scale; the can's plate is shorter by the frames' ratio, so both
              share one px-per-cm and stand at their true relative heights. */}
          <div
            ref={pair}
            className="col-span-4 flex items-end justify-center gap-[var(--grid-gap)] [--pair-h:min(64svh,calc((100vw-2*var(--gutter))*1.2))] md:col-span-7 md:justify-end"
          >
            <VesselPlate
              vessel="can"
              anchor="logo-can"
              label="yourlogo"
              alt={yourLogo.canAlt}
              height={`calc(var(--pair-h) * ${spec.can.frame.h / spec.bottle.frame.h})`}
            />
            <VesselPlate
              vessel="bottle"
              anchor="logo-bottle"
              label="yourlogo"
              alt={yourLogo.bottleAlt}
              height="var(--pair-h)"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
