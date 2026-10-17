import { inquiryForm, meta } from '../content/copy';
import { PageMeta } from '../components/PageMeta';
import { InquiryForm } from '../components/InquiryForm';
import { Container } from '../components/ui/Container';
import { Configurator } from '../sections/Configurator';
import { WhoWeServe } from '../sections/WhoWeServe';

export function CustomBranding() {
  return (
    <>
      <PageMeta {...meta.customBranding} />
      <div className="pt-[var(--header-h)]">
        <Configurator headingLevel={1} />
      </div>
      <Container className="pb-[var(--section-y)]">
        <div className="max-w-3xl">
          <InquiryForm type="branding" heading={inquiryForm.quoteHeading} anchor="quote" />
        </div>
      </Container>
      <WhoWeServe />
    </>
  );
}
