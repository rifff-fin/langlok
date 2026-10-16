import { useRef } from 'react';
import { products } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Eyebrow } from '../components/ui/Eyebrow';
import { ProductPlate } from '../components/ProductPlate';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { registerSpin, type AnchorId, type SpinId } from '../store/scene';

type Vessel = (typeof products)['can'] | (typeof products)['bottle'];

/**
 * 03 Products. Two full-viewport panels (can, then bottle). The live 3D vessel tracks each
 * plate; on desktop the panel pins for one extra screen while the vessel makes a full turn
 * and the spec callouts arrive one by one. On phones the turn follows the panel's pass.
 */
export function Products() {
  return (
    <section id="products" aria-labelledby="products-title" className="scroll-mt-[var(--header-h)]">
      <Container className="pt-[var(--section-y)]">
        <ChapterHead n={products.chapter} label={products.eyebrow} />
        <h2 id="products-title" className="mt-10 max-w-[14ch] text-[length:var(--text-h2)]">
          {products.title}
        </h2>
      </Container>

      <VesselPanel
        vessel={products.can}
        image="/img/mockups/can-front.jpeg"
        w={579}
        h={1024}
        anchor="products-can"
        spin="productsCan"
      />
      <VesselPanel
        vessel={products.bottle}
        image="/img/mockups/bottle-front.jpeg"
        w={912}
        h={1146}
        anchor="products-bottle"
        spin="productsBottle"
        flip
      />
    </section>
  );
}

function VesselPanel({
  vessel,
  image,
  w,
  h,
  anchor,
  spin,
  flip = false,
}: {
  vessel: Vessel;
  image: string;
  w: number;
  h: number;
  anchor: AnchorId;
  spin: SpinId;
  flip?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          phone: '(max-width: 767.98px) and (prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const el = panel.current!;
          const callouts = el.querySelectorAll('[data-callout]');
          let st: ScrollTrigger;
          if (ctx.conditions!.desktop) {
            const tl = gsap.timeline();
            tl.from(
              callouts,
              { autoAlpha: 0, y: 28, stagger: 0.14, duration: 0.24, ease: 'power2.out' },
              0.06,
            );
            tl.set({}, {}, 1); // callouts land by ~70% of the turn
            st = ScrollTrigger.create({
              trigger: el,
              start: 'top top',
              end: '+=100%',
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              animation: tl,
            });
          } else {
            // no pin on phones: the turn completes as the vessel reaches the centre
            st = ScrollTrigger.create({
              trigger: el.querySelector('[data-vessel-plate]'),
              start: 'top bottom',
              end: 'center center',
            });
            gsap.from(callouts, {
              autoAlpha: 0,
              y: 20,
              stagger: 0.08,
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: { trigger: callouts[0], start: 'top 88%', once: true },
            });
          }
          registerSpin(spin, st);
          return () => registerSpin(spin, null);
        },
      );
    },
    { scope: panel },
  );

  return (
    <div ref={panel} className="flex min-h-svh items-center py-16">
      <Container className="grid grid-cols-4 items-center gap-x-[var(--grid-gap)] gap-y-10 md:grid-cols-12">
        <div
          className={`col-span-4 md:col-span-5 lg:col-span-4 ${flip ? 'md:order-2 md:col-start-8 lg:col-start-9' : ''}`}
        >
          <p className="font-display text-[length:var(--text-h3)] leading-tight">{vessel.name}</p>
          <p className="mt-2 font-display text-[length:var(--text-h2)] leading-none text-rain">
            {vessel.volume}
          </p>

          <Eyebrow className="mt-10 text-slate">{products.specLabel}</Eyebrow>
          <ul className="mt-4 border-t border-aluminium">
            {vessel.callouts.map((c) => (
              <li
                key={c}
                data-callout
                className="flex items-baseline gap-4 border-b border-aluminium py-4"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 translate-y-[-0.15em] rounded-full bg-rain"
                  aria-hidden="true"
                />
                {c}
              </li>
            ))}
          </ul>
        </div>

        <ProductPlate
          src={image}
          alt={vessel.imageAlt}
          width={w}
          height={h}
          anchor={anchor}
          className={`col-span-4 md:col-span-6 ${flip ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}
        />
      </Container>
    </div>
  );
}
