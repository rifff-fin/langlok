import type { ComponentType, SVGProps } from 'react';
import { mission } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';
import {
  DeliveryIcon,
  DesignIcon,
  ProductionIcon,
  RecyclingIcon,
  StorageIcon,
} from '../components/icons';

const ICONS: Record<
  (typeof mission.stages)[number]['id'],
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  design: DesignIcon,
  production: ProductionIcon,
  delivery: DeliveryIcon,
  storage: StorageIcon,
  recycling: RecyclingIcon,
};

/**
 * 07 Mission. Editorial statement, the client's mission, then the five-stage strip
 * (a swipeable row on mobile; Phase 5 makes it a pinned horizontal scroll on desktop).
 */
export function Mission() {
  return (
    <section aria-labelledby="mission-title" className="py-[var(--section-y)]">
      <Container>
        <ChapterHead n={mission.chapter} label={mission.eyebrow} />

        <div className="mt-12 grid grid-cols-4 gap-x-[var(--grid-gap)] gap-y-10 md:grid-cols-12">
          <h2 id="mission-title" className="col-span-4 text-[length:var(--text-h2)] md:col-span-7">
            <Emph text={mission.statement} />
          </h2>
          <div data-reveal="fade" className="col-span-4 space-y-6 text-slate md:col-span-5 md:pt-4">
            {mission.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </Container>

      <Container className="mt-20">
        <ol
          data-reveal="stagger"
          className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-[var(--grid-gap)] overflow-x-auto px-[var(--gutter)] pb-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0"
        >
          {mission.stages.map((stage, i) => {
            const Icon = ICONS[stage.id];
            return (
              <li
                key={stage.id}
                className="flex w-[72vw] max-w-[300px] shrink-0 snap-start flex-col border-t border-ink pt-6 md:w-auto md:max-w-none"
              >
                <div className="flex items-center justify-between text-slate">
                  <span className="eyebrow tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <Icon className="text-rain" />
                </div>
                <h3 className="mt-8 text-[length:var(--text-h3)]">{stage.title}</h3>
                <p className="mt-3 text-slate">{stage.line}</p>
              </li>
            );
          })}
        </ol>

        <p
          data-reveal="fade"
          className="mt-16 font-display text-[length:var(--text-h3)] italic text-ink"
        >
          {mission.closing}
        </p>
      </Container>
    </section>
  );
}
