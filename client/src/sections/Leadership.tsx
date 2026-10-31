import { leadership } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';

/** The cards' ground: olive deepening downwards, a soft lime light behind the head. */
const CARD_GROUND =
  'radial-gradient(circle at 50% 34%, color-mix(in oklab, var(--lime) 60%, transparent) 0, transparent 46%),' +
  'linear-gradient(172deg, var(--olive) 0%, color-mix(in oklab, var(--olive) 70%, var(--olive-deep)) 58%, var(--olive-deep) 100%)';

/** Rain rings: the drop motif, spreading behind the shoulders (decorative). */
function Ripples({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {[70, 120, 175, 235].map((r, i) => (
        <ellipse
          key={r}
          cx="200"
          cy="430"
          rx={r * 1.4}
          ry={r * 0.42}
          fill="none"
          stroke="var(--lime)"
          strokeOpacity={0.42 - i * 0.08}
          strokeWidth="1.2"
        />
      ))}
    </svg>
  );
}

/**
 * 11 Leadership. Who leads Langlok Int. Company Ltd., in colour: the two portraits are cut
 * out (scripts/build-portraits.py) and stand on olive cards with a lime light and rain rings,
 * in a darker olive band with faint sage ripples. Cream text (8.5:1 on the band).
 */
export function Leadership() {
  return (
    <section
      aria-labelledby="leadership-title"
      className="relative overflow-hidden bg-paper py-[var(--section-y)]"
    >
      {/* the band's graphic: wide sage rings spreading from behind the portraits */}
      <svg
        viewBox="0 0 1000 1000"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[-18%] h-[150%] w-auto -translate-y-1/2 md:right-[-8%]"
      >
        {[180, 260, 350, 450, 560].map((r, i) => (
          <circle
            key={r}
            cx="500"
            cy="500"
            r={r}
            fill="none"
            stroke="var(--sage)"
            strokeOpacity={0.4 - i * 0.06}
            strokeWidth="1.5"
          />
        ))}
        <circle cx="500" cy="500" r="120" fill="var(--leaf)" fillOpacity="0.3" />
      </svg>

      <Container className="relative">
        <ChapterHead n={leadership.chapter} label={leadership.eyebrow} />
        <div className="mt-12 grid grid-cols-4 items-end gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-12">
          <div className="col-span-4 md:col-span-5">
            <h2
              id="leadership-title"
              className="text-[length:var(--text-h2)] text-ink [&_em]:text-rain"
            >
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
                  <div
                    className="relative aspect-[4/5] overflow-hidden"
                    style={{ background: CARD_GROUND }}
                  >
                    <Ripples />
                    <img
                      src={person.image}
                      alt={person.alt}
                      width={720}
                      height={900}
                      loading="lazy"
                      decoding="async"
                      className="relative block h-full w-full object-cover"
                    />
                    {/* a fine cream inset frame */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-2.5 border border-cream/35"
                    />
                  </div>
                  <figcaption className="mt-4 border-t border-aluminium pt-4 text-ink">
                    <h3 className="text-lg sm:text-xl md:text-2xl">{person.name}</h3>
                    <p className="eyebrow mt-3">{person.role}</p>
                    <p className="mt-1 text-sm">{leadership.company}</p>
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
