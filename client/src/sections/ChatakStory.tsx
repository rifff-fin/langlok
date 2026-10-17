import { lazy, Suspense } from 'react';
import { story } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Eyebrow } from '../components/ui/Eyebrow';
import type { Scene } from '../film/vignette';

// The story's pictures are drawn live, like the hero film (their own chunk).
const StoryVignette = lazy(() => import('../film/StoryVignette'));

/**
 * Sky colour per chapter, in the film's palette: the dry season's faint warmth in the
 * morning mist → the monsoon's slate → washed-clean light. --sun and --monsoon are allowed
 * only in this section.
 */
const DRY_SKY = 'color-mix(in oklab, var(--sun) 8%, var(--cloud))';

const SKIES: Record<number, { bg: string; dark?: boolean }> = {
  1: { bg: `linear-gradient(180deg, ${DRY_SKY}, var(--mist))` },
  2: { bg: 'linear-gradient(180deg, var(--mist), var(--cloud))' },
  3: {
    bg: 'linear-gradient(180deg, var(--cloud), color-mix(in oklab, var(--monsoon) 40%, var(--cloud)))',
  },
  4: {
    bg: 'linear-gradient(180deg, color-mix(in oklab, var(--monsoon) 80%, var(--cloud)), var(--monsoon) 55%, color-mix(in oklab, var(--monsoon) 82%, var(--ink)))',
    dark: true,
  },
  5: {
    bg: 'linear-gradient(180deg, color-mix(in oklab, var(--rain-light) 30%, var(--paper)), var(--paper) 65%, var(--mist))',
  },
};

/** The chapters with a picture, drawn like the film (never the client's photos). */
const PICTURES: Partial<Record<number, { scene: Scene; alt: string; ground: string }>> = {
  1: {
    scene: 'wait',
    alt: story.birdAlt,
    ground: 'linear-gradient(180deg, #e7ecee, #eef1f2)',
  },
  5: {
    scene: 'catch',
    alt: story.catchAlt,
    ground: 'linear-gradient(180deg, #7f8797, #a5acb8 60%, #c8ced5)',
  },
};

/**
 * 06 The Chatak story. Five full-viewport chapters following the client's story (lightly
 * edited for accuracy, see copy.ts). The first and the last have living pictures drawn
 * with the hero film's pieces. Phase 5 may still pin the chapters and add rain that
 * follows scroll speed; this layout stays as the reduced-motion version.
 */
export function ChatakStory({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const Sub = headingLevel === 1 ? 'h2' : 'h3';

  return (
    <section id="story" aria-labelledby="story-title" className="scroll-mt-[var(--header-h)]">
      <div style={{ background: DRY_SKY }}>
        <Container className="pt-[var(--section-y)]">
          <ChapterHead n={story.chapter} label={story.eyebrow} />
          {/* The words keep their own spacing (a margin and a real space): the home page's
              line reveal wraps both in one line, where a flex gap no longer applies. */}
          <Heading id="story-title" className="mt-12 flex flex-wrap items-baseline gap-y-2">
            <span
              lang="bn"
              className="me-[0.35em] font-bengali text-[length:var(--text-h2)] font-medium leading-none"
            >
              {story.titleBengali}
            </span>{' '}
            <span className="text-[length:var(--text-display)] leading-none">{story.title}</span>
          </Heading>
          <p className="mt-6 flex flex-wrap items-baseline gap-x-3 text-slate">
            <span className="eyebrow">{story.species.common}</span>
            <span aria-hidden="true">·</span>
            <em className="font-display text-lg">{story.species.latin}</em>
          </p>
          <p data-reveal="fade" className="mt-8 max-w-[52ch] text-lg leading-relaxed text-slate">
            {story.intro}
          </p>
        </Container>
      </div>

      {story.chapters.map((ch) => {
        const sky = SKIES[ch.id];
        const picture = PICTURES[ch.id];
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
                    : picture
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

              {picture && (
                <figure
                  data-reveal="fade"
                  className="relative col-span-4 m-0 aspect-[4/5] overflow-hidden md:col-span-5 md:col-start-8"
                  style={{ background: picture.ground }}
                >
                  <Suspense fallback={null}>
                    <StoryVignette scene={picture.scene} />
                  </Suspense>
                  <figcaption className="sr-only">{picture.alt}</figcaption>
                </figure>
              )}
            </Container>
          </article>
        );
      })}
    </section>
  );
}
