import { cta } from '../content/copy';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { DropIcon } from '../components/icons';
import { Emph } from '../components/ui/Emph';

/** 11 Closing call to action (the footer itself lives in RootLayout). */
export function CallToAction() {
  return (
    <section
      aria-labelledby="cta-title"
      className="border-t border-aluminium py-[var(--section-y)]"
    >
      <Container className="flex flex-col items-center text-center">
        <DropIcon className="h-10 w-10 text-rain" />
        <h2 id="cta-title" className="mt-8 max-w-[14ch] text-[length:var(--text-h2)]">
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
