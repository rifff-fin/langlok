import { story } from '../content/copy';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';
import { ReelControls, ReelFilm } from '../film/StoryReel';
import { useStoryReel } from '../film/useStoryReel';

/**
 * 06 The Chatak story: the drawn film fills the window (film/StoryReel.tsx: the hero film's
 * story, played by time from the wait to the river), and the story behind the logo is told
 * once over it, in about a hundred words. Wide screens: one screen, the words down the right
 * side on a veil of mist (`.story-veil`), the bird on the left. Phones: the film is the first
 * screen with the title at its foot, and the words follow it.
 */
export function ChatakStory({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const { frameRef, canvasRef, ...reel } = useStoryReel();

  return (
    <section id="story" data-nav="/story" aria-labelledby="story-title" className="relative">
      <ReelFilm
        frameRef={frameRef}
        canvasRef={canvasRef}
        className="absolute inset-x-0 top-0 h-svh lg:bottom-0 lg:h-auto"
      />
      <div
        aria-hidden="true"
        className="story-veil pointer-events-none absolute inset-x-0 top-0 h-svh lg:bottom-0 lg:h-auto"
      />

      <Container className="relative">
        <div className="grid grid-cols-4 md:grid-cols-12 lg:min-h-svh lg:items-center">
          <div className="col-span-4 flex flex-col md:col-span-9 lg:col-span-5 lg:col-start-8 lg:pt-[calc(var(--header-h)+1.5rem)] lg:pb-8">
            {/* phones: the title at the foot of the film, the controls clear of the Motion
                switch; wide screens: one column, the controls last */}
            <div className="flex h-svh flex-col justify-end pb-20 lg:contents">
              <ChapterHead n={story.chapter} label={story.eyebrow} />
              {/* The words keep their own spacing (a margin and a real space): the line
                  reveal wraps both in one line, where a flex gap no longer applies. */}
              <Heading id="story-title" className="mt-6 flex flex-wrap items-baseline gap-y-2">
                <span
                  lang="bn"
                  className="me-[0.35em] font-bengali text-[length:var(--text-h3)] font-medium leading-none"
                >
                  {story.titleBengali}
                </span>{' '}
                <span className="text-[length:var(--text-h2)] leading-none">{story.title}</span>
              </Heading>
              <p className="mt-4 flex flex-wrap items-baseline gap-x-3 text-ink">
                <span className="eyebrow">{story.species.common}</span>
                <span aria-hidden="true">·</span>
                <em className="font-display text-lg">{story.species.latin}</em>
              </p>
              <ReelControls {...reel} className="mt-8 lg:order-1 lg:mt-6" />
            </div>

            <div className="pt-4 pb-[var(--section-y)] lg:pt-6 lg:pb-0">
              <p data-reveal="fade" className="leading-relaxed text-ink">
                {story.text[0]}
              </p>
              <blockquote
                data-reveal="fade"
                className="headline mt-5 text-2xl text-ink xl:text-3xl"
              >
                <Emph text={story.quote} />
              </blockquote>
              <p data-reveal="fade" className="mt-5 leading-relaxed text-ink">
                {story.text[1]}
              </p>
              <p data-reveal="fade" className="mt-5 border-t border-aluminium pt-4 text-ink">
                {story.closing}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
