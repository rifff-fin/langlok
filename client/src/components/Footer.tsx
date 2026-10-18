import { Link } from 'react-router';
import { contact, footer, nav, site } from '../content/copy';
import { Logo } from './Logo';
import { Container } from './ui/Container';
import { Eyebrow } from './ui/Eyebrow';
import { Hairline } from './ui/Hairline';

export function Footer() {
  return (
    <footer className="relative z-[1] bg-cloud pt-20 pb-10">
      <Container>
        <div className="grid grid-cols-4 gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-12">
          <div className="col-span-4 md:col-span-5">
            <Logo variant="full" className="-ml-1 h-auto w-[min(100%,340px)]" />
            <p className="mt-6 max-w-[36ch] text-slate">{footer.missionLine}</p>
            <Eyebrow as="h2" className="mt-10 text-slate">
              {footer.officesHeading}
            </Eyebrow>
            <ul className="mt-4 space-y-2 text-sm">
              {contact.offices.map((office) => (
                <li key={office.id} className="text-slate">
                  <span className="text-ink">{office.city}</span>
                  <span aria-hidden="true"> · </span>
                  <a
                    href={office.phone.href}
                    className="text-ink no-underline hover:text-rain-deep"
                  >
                    {office.phone.display}
                  </a>
                  {office.whatsapp && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <a href={office.whatsapp} target="_blank" rel="noreferrer">
                        {footer.whatsapp}
                      </a>
                    </>
                  )}
                </li>
              ))}
              <li className="text-slate">
                <span className="text-ink">{contact.factory.label}</span>
                <span aria-hidden="true"> · </span>
                {contact.factory.lines[0]}
              </li>
            </ul>
          </div>

          <nav
            aria-label={footer.exploreHeading}
            className="col-span-2 md:col-span-3 md:col-start-7"
          >
            <Eyebrow as="h2" className="text-slate">
              {footer.exploreHeading}
            </Eyebrow>
            <ul className="mt-5 space-y-3">
              {nav.items.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="text-ink no-underline hover:text-rain-deep">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-3">
            <Eyebrow as="h2" className="text-slate">
              {footer.followHeading}
            </Eyebrow>
            <ul className="mt-5 space-y-3">
              {footer.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="text-ink no-underline hover:text-rain-deep">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Hairline className="mt-16" />
        <div className="mt-6 flex flex-col gap-3 text-sm text-slate md:flex-row md:justify-between">
          <p>{site.manufactured}</p>
          <p>{footer.legal}</p>
        </div>
      </Container>
    </footer>
  );
}
