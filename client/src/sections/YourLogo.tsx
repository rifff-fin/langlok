import { useCallback, useRef } from 'react';
import { products, yourLogo } from '../content/copy';
import { Button } from '../components/ui/Button';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { SlottedVessel } from '../components/SlottedVessel';
import { LOGO_SLOTS } from '../components/logoSlots';
import { useVesselAnchor } from '../hooks/useVesselAnchor';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { registerSpin } from '../store/scene';

/**
 * 04 Your Logo Here. Both live vessels stand side by side on the pair box; one more full
 * turn with scroll, and the label switches to YOUR LOGO HERE while the print faces away,
 * so each vessel comes round already rebranded. The slotted photos are the static version.
 */
export function YourLogo() {
  const section = useRef<HTMLElement>(null);
  const pairEl = useRef<HTMLDivElement | null>(null);
  const anchor = useVesselAnchor('logo-pair');
  const pairRef = useCallback(
    (el: HTMLDivElement | null) => {
      pairEl.current = el;
      return anchor(el);
    },
    [anchor],
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          phone: '(max-width: 767.98px) and (prefers-reduced-motion: no-preference)',
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
            : // no pin on phones: the turn (and swap) completes as the pair reaches the centre
              ScrollTrigger.create({
                trigger: pairEl.current,
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
      className="flex min-h-svh items-center py-24"
    >
      <Container>
        <ChapterHead n={yourLogo.chapter} label={yourLogo.eyebrow} />

        <div className="mt-12 grid grid-cols-4 items-end gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-12">
          <div className="col-span-4 md:col-span-5">
            <h2 id="your-logo-title" className="text-[length:var(--text-h2)]">
              {yourLogo.title}
            </h2>
            <p data-reveal="fade" className="mt-6 max-w-[34ch] text-slate">
              {yourLogo.sub}
            </p>
            <Button href={yourLogo.cta.href} className="mt-10">
              {yourLogo.cta.label}
            </Button>
          </div>

          <div
            ref={pairRef}
            data-vessel-plate
            className="col-span-4 grid w-full grid-cols-2 items-end gap-[var(--grid-gap)] md:col-span-7 md:max-w-[64svh] md:justify-self-end"
          >
            <SlottedVessel
              src="/img/mockups/can-front.jpeg"
              alt={products.can.imageAlt}
              width={579}
              height={1024}
              slot={LOGO_SLOTS.can}
            />
            <SlottedVessel
              src="/img/mockups/bottle-front.jpeg"
              alt={products.bottle.imageAlt}
              width={912}
              height={1146}
              slot={LOGO_SLOTS.bottle}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
