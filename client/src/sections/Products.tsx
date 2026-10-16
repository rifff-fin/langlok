import { products } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Eyebrow } from '../components/ui/Eyebrow';
import { ProductPlate } from '../components/ProductPlate';

type Vessel = (typeof products)['can'] | (typeof products)['bottle'];

/**
 * 03 Products. Two full-viewport panels (can, then bottle).
 * Phase 3 pins this section, replaces the photos with the live 3D vessels and
 * slides the callouts in from the hairline grid.
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

      <VesselPanel vessel={products.can} image="/img/mockups/can-front.jpeg" w={579} h={1024} />
      <VesselPanel
        vessel={products.bottle}
        image="/img/mockups/bottle-front.jpeg"
        w={912}
        h={1146}
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
  flip = false,
}: {
  vessel: Vessel;
  image: string;
  w: number;
  h: number;
  flip?: boolean;
}) {
  return (
    <div className="flex min-h-svh items-center py-16">
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
              <li key={c} className="flex items-baseline gap-4 border-b border-aluminium py-4">
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
          className={`col-span-4 md:col-span-6 ${flip ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}
        />
      </Container>
    </div>
  );
}
