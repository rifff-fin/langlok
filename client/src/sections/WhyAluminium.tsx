import { whyAluminium } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';

/** 09 Why aluminium. Footnotes render only once a card has a real source. */
export function WhyAluminium() {
  const sourced = whyAluminium.cards.filter((c) => c.source);

  return (
    <section aria-labelledby="why-title" className="py-[var(--section-y)]">
      <Container>
        <ChapterHead n={whyAluminium.chapter} label={whyAluminium.eyebrow} />
        <h2 id="why-title" className="mt-12 max-w-[18ch] text-[length:var(--text-h2)]">
          <Emph text={whyAluminium.title} />
        </h2>

        <ul data-reveal="stagger" className="mt-16 grid gap-[var(--grid-gap)] md:grid-cols-3">
          {whyAluminium.cards.map((card, i) => (
            <li key={card.title} className="flex flex-col bg-paper p-8 md:min-h-[22rem]">
              <span className="font-display text-[length:var(--text-h2)] leading-none text-rain">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-auto pt-12 text-[length:var(--text-h3)]">
                {card.title}
                {card.source && (
                  <sup className="ml-1 text-sm text-rain-deep">{sourced.indexOf(card) + 1}</sup>
                )}
              </h3>
              <p className="mt-3 text-slate">{card.body}</p>
            </li>
          ))}
        </ul>

        {sourced.length > 0 && (
          <ol className="mt-8 list-decimal space-y-1 pl-5 text-sm text-slate">
            {sourced.map((c) => (
              <li key={c.title}>{c.source}</li>
            ))}
          </ol>
        )}
      </Container>
    </section>
  );
}
