import { inquiryForm, meta, recan } from '../content/copy';
import { PageMeta } from '../components/PageMeta';
import { InquiryForm } from '../components/InquiryForm';
import { Container } from '../components/ui/Container';
import { ReCanLoop } from '../sections/ReCanLoop';
import { WhyAluminium } from '../sections/WhyAluminium';

export function ReCan() {
  return (
    <>
      <PageMeta {...meta.recan} />
      <div className="pt-[var(--header-h)]">
        <ReCanLoop headingLevel={1} />
      </div>
      <Container className="py-[var(--section-y)]">
        <div className="grid gap-12 md:grid-cols-12">
          <p className="font-display text-[length:var(--text-h3)] leading-snug md:col-span-4">
            {recan.pageIntro}
          </p>
          <div className="md:col-span-7 md:col-start-6">
            <InquiryForm type="recan" heading={inquiryForm.recanHeading} />
          </div>
        </div>
      </Container>
      <WhyAluminium />
    </>
  );
}
