import type { CSSProperties } from 'react';
import { story } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Eyebrow } from '../components/ui/Eyebrow';

/**
 * Sky colour per chapter: pale dry season → bruised monsoon violet → washed-clean light.
 * --sun and --monsoon are allowed only in this section.
 */
const DRY_SKY = 'color-mix(in oklab, var(--sun) 22%, var(--paper))';

const SKIES: Record<number, { bg: string; dark?: boolean }> = {
  1: { bg: `linear-gradient(180deg, ${DRY_SKY}, var(--paper))` },
  2: {
    bg: 'linear-gradient(180deg, var(--paper), color-mix(in oklab, var(--sun) 12%, var(--cloud)))',
  },
  3: {
    bg: 'linear-gradient(180deg, color-mix(in oklab, var(--sun) 12%, var(--cloud)), color-mix(in oklab, var(--monsoon) 30%, var(--cloud)))',
  },
  4: {
    bg: 'linear-gradient(180deg, color-mix(in oklab, var(--monsoon) 80%, var(--cloud)), var(--monsoon) 70%, color-mix(in oklab, var(--monsoon) 85%, var(--ink)))',
    dark: true,
  },
  5: {
    bg: 'linear-gradient(180deg, color-mix(in oklab, var(--rain-light) 30%, var(--paper)), var(--paper) 65%, var(--mist))',
  },
};

/** Crops of client artwork. TODO(client): replace with the layered, high-res bird art. */
const CROPS: Record<number, { src: string; alt: string; style: CSSProperties }> = {
  1: {
    src: '/img/mockups/logo-theme.jpeg',
    alt: story.birdAlt,
    style: { width: '240%', left: '-72%', top: '-8%' },
  },
  5: {
    src: '/img/mockups/can-front.jpeg',
    alt: story.catchAlt,
    style: { width: '210%', left: '-52%', top: '-62%' },
  },
};

/**
 * 06 The Chatak story. Five full-viewport chapters following the client's text.
 * Phase 5 pins the chapters, adds rain particles (density follows scroll speed) and
 * animates the bird; this layout stays as the reduced-motion version.
 */
export function ChatakStory({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const Sub = headingLevel === 1 ? 'h2' : 'h3';

  return (
    <section id="story" aria-labelledby="story-title" className="scroll-mt-[var(--header-h)]">
      <div style={{ background: DRY_SKY }}>
        <Container className="pt-[var(--section-y)]">
          <ChapterHead n={story.chapter} label={story.eyebrow} />
          <Heading id="story-title" className="mt-12 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <span
              lang="bn"
              className="font-bengali text-[length:var(--text-h2)] font-medium leading-none"
            >
              {story.titleBengali}
            </span>
            <span className="text-[length:var(--text-display)] leading-none">{story.title}</span>
          </Heading>
          <p className="mt-6 flex flex-wrap items-baseline gap-x-3 text-slate">
            <span className="eyebrow">{story.species.common}</span>
            <span aria-hidden="true">·</span>
            <em className="font-display text-lg">{story.species.latin}</em>
          </p>
        </Container>
      </div>

      {story.chapters.map((ch) => {
        const sky = SKIES[ch.id];
        const crop = CROPS[ch.id];
        const isKeyLine = ch.body.length === 0;
        const text = sky.dark ? 'text-paper' : 'text-ink';
        const muted = sky.dark ? 'text-paper/85' : 'text-slate';

        return (
          <article
            key={ch.id}
            aria-labelledby={`story-ch-${ch.id}`}
            className="flex min-h-svh items-center py-24"
            style={{ background: sky.bg }}
          >
            <Container
              className={
                isKeyLine
                  ? 'text-center'
                  : 'grid grid-cols-4 items-center gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-12'
              }
            >
              <div
                className={
                  isKeyLine
                    ? ''
                    : crop
                      ? 'col-span-4 md:col-span-6'
                      : 'col-span-4 md:col-span-8 md:col-start-3'
                }
              >
                <Eyebrow className={muted}>{`${story.chapter}.${ch.id}`}</Eyebrow>
                <Sub
                  id={`story-ch-${ch.id}`}
                  className={`mt-6 ${text} ${
                    isKeyLine
                      ? 'mx-auto max-w-[18ch] text-[length:var(--text-h2)] italic'
                      : 'text-[length:var(--text-h3)]'
                  }`}
                >
                  {ch.heading}
                </Sub>
                {ch.body.map((para) => (
                  <p
                    key={para}
                    data-reveal="fade"
                    className={`mt-6 max-w-[42ch] text-lg leading-relaxed ${muted}`}
                  >
                    {para}
                  </p>
                ))}
              </div>

              {crop && (
                <figure
                  data-reveal="fade"
                  className="relative col-span-4 m-0 aspect-[4/5] overflow-hidden md:col-span-5 md:col-start-8"
                >
                  <img
                    src={crop.src}
                    alt={crop.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute max-w-none"
                    style={crop.style}
                  />
                </figure>
              )}
            </Container>
          </article>
        );
      })}
    </section>
  );
}
