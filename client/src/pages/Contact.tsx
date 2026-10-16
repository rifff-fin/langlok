import { contact, meta, site } from '../content/copy';
import { PageMeta } from '../components/PageMeta';
import { InquiryForm } from '../components/InquiryForm';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';

export function Contact() {
  return (
    <>
      <PageMeta {...meta.contact} />
      <Container className="pt-[calc(var(--header-h)+var(--section-y)/2)] pb-[var(--section-y)]">
        <ChapterHead n="—" label={contact.eyebrow} />
        <div className="mt-12 grid grid-cols-4 gap-x-[var(--grid-gap)] gap-y-16 md:grid-cols-12">
          <div className="col-span-4 md:col-span-5">
            <h1 className="text-[length:var(--text-h2)]">
              <Emph text={contact.title} />
            </h1>
            <p className="mt-6 max-w-[40ch] text-slate">{contact.intro}</p>

            <address className="mt-12 border-t border-aluminium pt-6 not-italic">
              <p className="font-display text-xl">{contact.addressHeading}</p>
              {contact.address.map((line) => (
                <p key={line} className="text-slate">
                  {line}
                </p>
              ))}
              {contact.email && (
                <p className="mt-4">
                  <span className="eyebrow mr-3 text-slate">{contact.emailLabel}</span>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </p>
              )}
            </address>
            <p className="mt-8 text-sm text-slate">{site.manufactured}</p>
          </div>

          <div className="col-span-4 md:col-span-7">
            <InquiryForm type="contact" />
          </div>
        </div>
      </Container>
    </>
  );
}
