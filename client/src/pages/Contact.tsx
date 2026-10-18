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
              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                {contact.offices.map((office) => (
                  <div key={office.id}>
                    <p className="eyebrow text-ink">{office.label}</p>
                    {office.lines.map((line) => (
                      <p key={line} className="mt-1 text-slate">
                        {line}
                      </p>
                    ))}
                    <p className="mt-3">
                      <span className="sr-only">{contact.phoneLabel}: </span>
                      <a href={office.phone.href} className="text-ink">
                        {office.phone.display}
                      </a>
                    </p>
                    {office.whatsapp && (
                      <p className="mt-1">
                        <a href={office.whatsapp} target="_blank" rel="noreferrer">
                          {contact.whatsappLabel}
                        </a>
                      </p>
                    )}
                  </div>
                ))}
                <div>
                  <p className="eyebrow text-ink">{contact.factory.label}</p>
                  {contact.factory.lines.map((line) => (
                    <p key={line} className="mt-1 text-slate">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
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
