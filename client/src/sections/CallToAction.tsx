import { cta } from '../content/copy';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { DropIcon } from '../components/icons';
import { Emph } from '../components/ui/Emph';

/**
 * 12 Closing call to action (the footer itself lives in RootLayout): olive deepening downwards
 * into the footer, with the accent olive as a soft light behind the drop.
 */
export function CallToAction() {
  return (
    <section
      aria-labelledby="cta-title"
      className="bg-[radial-gradient(60%_45%_at_50%_0%,color-mix(in_oklab,var(--grass-top)_55%,transparent),transparent_70%),linear-gradient(180deg,var(--grass-mid)_0%,var(--grass-mid)_45%,var(--grass-deep)_100%)] pt-[var(--section-y)] pb-[calc(var(--section-y)*1.3)]"
    >
      <Container className="flex flex-col items-center text-center">
        <DropIcon className="h-10 w-10 text-rain" />
        <h2 id="cta-title" className="mt-8 max-w-[14ch] text-[length:var(--text-h2)] text-ink">
          <Emph text={cta.title} />
        </h2>
        <div data-reveal="fade" className="mt-12 flex flex-wrap justify-center gap-4">
          <Button href={cta.primary.href}>{cta.primary.label}</Button>
          <Button href={cta.secondary.href} variant="secondary">
            {cta.secondary.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
