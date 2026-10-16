import { Link } from 'react-router';
import { footer, nav, site } from '../content/copy';
import { Logo } from './Logo';
import { Container } from './ui/Container';
import { Eyebrow } from './ui/Eyebrow';
import { Hairline } from './ui/Hairline';

export function Footer() {
  return (
    <footer className="bg-cloud pt-20 pb-10">
      <Container>
        <div className="grid grid-cols-4 gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-12">
          <div className="col-span-4 md:col-span-5">
            <Logo />
            <p className="mt-6 max-w-[36ch] text-slate">{footer.missionLine}</p>
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
