import { recan } from '../content/copy';
import { Button } from '../components/ui/Button';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';

/** Label positions around the loop, clockwise from the top. */
const STEP_POSITIONS = [
  'top-0 left-1/2 -translate-x-1/2 -translate-y-[130%]',
  'top-1/2 right-0 translate-x-[calc(100%+14px)] -translate-y-1/2',
  'bottom-0 left-1/2 -translate-x-1/2 translate-y-[130%]',
  'top-1/2 left-0 -translate-x-[calc(100%+14px)] -translate-y-1/2',
];

/**
 * 08 ReCan loop. Phase 5 draws the circle on scroll (DrawSVG) and moves the can along
 * it (MotionPath). Counters stay hidden until /api/stats has real numbers.
 */
export function ReCanLoop({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <section aria-labelledby="recan-title" className="bg-cloud py-[var(--section-y)]">
      <Container>
        <ChapterHead n={recan.chapter} label={recan.eyebrow} />

        <div className="mt-12 grid grid-cols-4 items-center gap-x-[var(--grid-gap)] gap-y-24 md:grid-cols-12">
          <div className="col-span-4 md:col-span-9 lg:col-span-5">
            <Heading id="recan-title" className="text-[length:var(--text-h2)]">
              <Emph text={recan.title} />
            </Heading>
            <p data-reveal="fade" className="mt-6 max-w-[42ch] text-slate">
              {recan.sub}
            </p>
            <Button href={recan.cta.href} variant="secondary" className="mt-10">
              {recan.cta.label}
            </Button>
          </div>

          {/* Side labels need room: stacked below lg, side by side from lg up. */}
          <div className="col-span-4 flex justify-center md:col-span-12 lg:col-span-6 lg:col-start-7">
            <div data-reveal="fade" className="relative aspect-square w-[min(46vw,360px)]">
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-hidden="true"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="99"
                  fill="none"
                  stroke="var(--aluminium)"
                  strokeWidth="1"
                />
                <circle
                  data-recan-path
                  cx="100"
                  cy="100"
                  r="99"
                  fill="none"
                  stroke="var(--rain)"
                  strokeWidth="1.25"
                  strokeDasharray="4 6"
                />
                {[0, 90, 180, 270].map((deg) => {
                  const rad = ((deg - 90) * Math.PI) / 180;
                  return (
                    <circle
                      key={deg}
                      cx={100 + 99 * Math.cos(rad)}
                      cy={100 + 99 * Math.sin(rad)}
                      r="4"
                      fill="var(--paper)"
                      stroke="var(--ink)"
                      strokeWidth="1.25"
                    />
                  );
                })}
                {/* The travelling can (MotionPath in Phase 5), parked at "Serve". */}
                <g data-recan-can transform="translate(100 100)">
                  <rect
                    x="-11"
                    y="-20"
                    width="22"
                    height="40"
                    rx="4"
                    fill="var(--paper)"
                    stroke="var(--ink)"
                    strokeWidth="1.25"
                  />
                  <path d="M-11 -13h22M-11 13h22" stroke="var(--aluminium)" strokeWidth="1" />
                </g>
              </svg>

              <ol aria-label={recan.loopLabel}>
                {recan.steps.map((step, i) => (
                  <li
                    key={step}
                    className={`absolute font-display text-lg whitespace-nowrap md:text-2xl ${STEP_POSITIONS[i]}`}
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
