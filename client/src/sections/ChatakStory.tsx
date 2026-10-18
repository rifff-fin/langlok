import { story } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';
import { StoryReel } from '../film/StoryReel';

/**
 * 06 The Chatak story: the story behind the logo told once, in about a hundred words, beside
 * a short drawn film of it (film/StoryReel.tsx: the hero film's story, played by time from
 * the wait to the river). About one screen of scroll; the film is never the client's photos.
 */
export function ChatakStory({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="scroll-mt-[var(--header-h)] py-[var(--section-y)]"
    >
      <Container>
        <ChapterHead n={story.chapter} label={story.eyebrow} />
        <div className="mt-12 flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          {/* The words keep their own spacing (a margin and a real space): the home page's
              line reveal wraps both in one line, where a flex gap no longer applies. */}
          <Heading id="story-title" className="flex flex-wrap items-baseline gap-y-2">
            <span
              lang="bn"
              className="me-[0.35em] font-bengali text-[length:var(--text-h2)] font-medium leading-none"
            >
              {story.titleBengali}
            </span>{' '}
            <span className="text-[length:var(--text-display)] leading-none">{story.title}</span>
          </Heading>
          <p className="flex flex-wrap items-baseline gap-x-3 text-slate lg:pb-3">
            <span className="eyebrow">{story.species.common}</span>
            <span aria-hidden="true">·</span>
            <em className="font-display text-lg">{story.species.latin}</em>
          </p>
        </div>

        <div className="mt-12 grid grid-cols-4 gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-12 lg:mt-16">
          <figure data-reveal="fade" className="col-span-4 m-0 md:col-span-12 lg:col-span-7">
            <StoryReel />
            <figcaption className="sr-only">{story.reel.alt}</figcaption>
          </figure>

          <div className="col-span-4 md:col-span-9 lg:col-span-4 lg:col-start-9">
            <p data-reveal="fade" className="text-lg leading-relaxed text-slate">
              {story.text[0]}
            </p>
            <blockquote
              data-reveal="fade"
              className="headline mt-8 text-[length:var(--text-h3)] text-ink"
            >
              <Emph text={story.quote} />
            </blockquote>
            <p data-reveal="fade" className="mt-8 text-lg leading-relaxed text-slate">
              {story.text[1]}
            </p>
            <p data-reveal="fade" className="mt-8 border-t border-aluminium pt-6 text-ink">
              {story.closing}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
