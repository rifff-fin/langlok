import { meta } from '../content/copy';
import { PageMeta } from '../components/PageMeta';
import { ChatakStory } from '../sections/ChatakStory';
import { CallToAction } from '../sections/CallToAction';

export function Story() {
  return (
    <>
      <PageMeta {...meta.story} />
      <div className="pt-[var(--header-h)]">
        <ChatakStory headingLevel={1} />
      </div>
      <CallToAction />
    </>
  );
}
