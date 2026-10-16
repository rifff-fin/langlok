import { meta } from '../content/copy';
import { PageMeta } from '../components/PageMeta';
import { Hero } from '../sections/Hero';
import { Products } from '../sections/Products';
import { YourLogo } from '../sections/YourLogo';
import { Configurator } from '../sections/Configurator';
import { ChatakStory } from '../sections/ChatakStory';
import { Mission } from '../sections/Mission';
import { ReCanLoop } from '../sections/ReCanLoop';
import { WhyAluminium } from '../sections/WhyAluminium';
import { WhoWeServe } from '../sections/WhoWeServe';
import { CallToAction } from '../sections/CallToAction';

/** The full scroll experience, in master-plan order (§4.2). */
export function Home() {
  return (
    <>
      <PageMeta {...meta.home} />
      <Hero />
      <Products />
      <YourLogo />
      <Configurator />
      <ChatakStory />
      <Mission />
      <ReCanLoop />
      <WhyAluminium />
      <WhoWeServe />
      <CallToAction />
    </>
  );
}
