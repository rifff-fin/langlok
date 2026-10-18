import { leadership } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';

/**
 * 11 Leadership. A quiet, official look at who leads Langlok Int. Company Ltd.: two
 * portraits with their roles (no names, as the client asked), beside where the company
 * works and where VERSA is made. Portraits: scripts/build-portraits.py (cut out, set on
 * one studio backdrop, in black and white, so two very different photos read as a pair).
 */
export function Leadership() {
  return (
    <section aria-labelledby="leadership-title" className="py-[var(--section-y)]">
      <Container>
        <ChapterHead n={leadership.chapter} label={leadership.eyebrow} />
        <div className="mt-12 grid grid-cols-4 items-end gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-12">
          <div className="col-span-4 md:col-span-5">
            <h2 id="leadership-title" className="text-[length:var(--text-h2)]">
              <Emph text={leadership.title} />
            </h2>
            <p data-reveal="fade" className="mt-6 max-w-[40ch] text-slate">
              {leadership.sub}
            </p>
          </div>

          <ul
            data-reveal="stagger"
            className="col-span-4 grid grid-cols-2 gap-[var(--grid-gap)] md:col-span-6 md:col-start-7"
          >
            {leadership.people.map((person) => (
              <li key={person.id}>
                <figure className="m-0">
                  <div className="aspect-[4/5] overflow-hidden bg-cloud">
                    <img
                      src={person.image}
                      alt={person.alt}
                      width={720}
                      height={900}
                      loading="lazy"
                      decoding="async"
                      className="block h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-4 border-t border-aluminium pt-4">
                    <p className="eyebrow text-ink">{person.role}</p>
                    <p className="mt-2 text-sm text-slate">{leadership.company}</p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
