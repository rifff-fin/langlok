import { meta } from '../content/copy';
import { PageMeta } from '../components/PageMeta';
import { ChatakStory } from '../sections/ChatakStory';
import { CallToAction } from '../sections/CallToAction';

export function Story() {
  return (
    <>
      <PageMeta {...meta.story} />
      {/* the story's film fills the window from the top, under the header */}
      <ChatakStory headingLevel={1} />
      <CallToAction />
    </>
  );
}
