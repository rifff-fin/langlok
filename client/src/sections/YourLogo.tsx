import { products, yourLogo } from '../content/copy';
import { Button } from '../components/ui/Button';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { SlottedVessel } from '../components/SlottedVessel';
import { LOGO_SLOTS } from '../components/logoSlots';

/**
 * 04 Your Logo Here. Static stand-in: both vessel photos with a dashed logo slot laid
 * over the bird + wordmark zone. Phase 4 replaces this with the 3D spin and the
 * hidden-side label swap.
 */
export function YourLogo() {
  return (
    <section
      aria-labelledby="your-logo-title"
      className="flex min-h-svh items-center py-[var(--section-y)]"
    >
      <Container>
        <ChapterHead n={yourLogo.chapter} label={yourLogo.eyebrow} />

        <div className="mt-12 grid grid-cols-4 items-end gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-12">
          <div className="col-span-4 md:col-span-5">
            <h2 id="your-logo-title" className="text-[length:var(--text-h2)]">
              {yourLogo.title}
            </h2>
            <p className="mt-6 max-w-[34ch] text-slate">{yourLogo.sub}</p>
            <Button href={yourLogo.cta.href} className="mt-10">
              {yourLogo.cta.label}
            </Button>
          </div>

          <div className="col-span-4 grid grid-cols-2 items-end gap-[var(--grid-gap)] md:col-span-7">
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
