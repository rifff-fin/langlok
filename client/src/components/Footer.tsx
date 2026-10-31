import { Link } from 'react-router';
import { contact, footer, nav, site } from '../content/copy';
import { Logo } from './Logo';
import { Container } from './ui/Container';
import { Eyebrow } from './ui/Eyebrow';
import { Hairline } from './ui/Hairline';

/** Social accounts with a real address (the placeholders are '#'). */
const social = footer.social.filter((s) => s.href.length > 1);

/** The footer: the darker olive, deepening downwards (white text, 9:1 or more). */
export function Footer() {
  return (
    <footer className="relative z-[1] bg-[linear-gradient(180deg,var(--grass-deep),var(--grass-night))] pt-20 pb-24 text-white">
      <Container>
        <div className="grid grid-cols-4 gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-12">
          <div className="col-span-4 md:col-span-5">
            <Logo variant="full" className="h-auto w-[min(100%,300px)]" />
            <p className="mt-6 max-w-[36ch] text-white">{footer.missionLine}</p>
            <Eyebrow as="h2" className="mt-10 text-white">
              {footer.officesHeading}
            </Eyebrow>
            <ul className="mt-4 space-y-2 text-sm">
              {contact.offices.map((office) => (
                <li key={office.id} className="text-white">
                  <span className="text-white">{office.city}</span>
                  <span aria-hidden="true"> · </span>
                  <a
                    href={office.phone.href}
                    className="text-white no-underline hover:underline"
                  >
                    {office.phone.display}
                  </a>
                  {office.whatsapp && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <a
                        href={office.whatsapp}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white underline"
                      >
                        {footer.whatsapp}
                      </a>
                    </>
                  )}
                </li>
              ))}
              <li className="text-white">
                <span className="text-white">{contact.factory.label}</span>
                <span aria-hidden="true"> · </span>
                {contact.factory.lines[0]}
              </li>
            </ul>
          </div>

          <nav
            aria-label={footer.exploreHeading}
            className="col-span-2 md:col-span-3 md:col-start-7"
          >
            <Eyebrow as="h2" className="text-white">
              {footer.exploreHeading}
            </Eyebrow>
            <ul className="mt-5 space-y-3">
              {nav.items.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-white no-underline hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* only accounts with a real link; none yet, so the column waits (TODO(client)) */}
          {social.length > 0 && (
            <div className="col-span-2 md:col-span-3">
              <Eyebrow as="h2" className="text-white">
                {footer.followHeading}
              </Eyebrow>
              <ul className="mt-5 space-y-3">
                {social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="text-white no-underline hover:underline"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Hairline className="mt-16 border-white/30!" />
        <div className="mt-6 flex flex-col gap-3 text-sm text-white md:flex-row md:justify-between">
          <p>{site.manufactured}</p>
          <p>{footer.legal}</p>
        </div>
      </Container>
    </footer>
  );
}
