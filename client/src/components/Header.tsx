import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { nav } from '../content/copy';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { CloseIcon, MenuIcon } from './icons';

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route (or hash) changes.
  const [lastLocation, setLastLocation] = useState(location);
  if (location !== lastLocation) {
    setLastLocation(location);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-aluminium/70 bg-mist/95">
      <div className="mx-auto flex h-[var(--header-h)] max-w-[var(--page-max)] items-center justify-between gap-8 px-[var(--gutter)]">
        <Link to="/" className="-ml-1 shrink-0 no-underline" aria-label={nav.homeLabel}>
          <Logo className="h-9 w-auto md:h-10" />
        </Link>

        <nav aria-label={nav.primaryLabel} className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {nav.items.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `eyebrow no-underline transition-colors duration-[var(--dur-ui)] hover:text-rain-deep ${
                      isActive && !item.href.includes('#') ? 'text-rain-deep' : 'text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Button href={nav.cta.href} className="min-h-10 px-5">
              {nav.cta.label}
            </Button>
          </div>
          <button
            type="button"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? nav.menuClose : nav.menuOpen}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label={nav.primaryLabel}
        hidden={!open}
        className="border-t border-aluminium/70 bg-mist lg:hidden"
      >
        <ul className="mx-auto max-w-[var(--page-max)] px-[var(--gutter)] py-6">
          {nav.items.map((item) => (
            <li key={item.href} className="border-b border-aluminium/60 last:border-0">
              <Link
                to={item.href}
                className="block py-4 font-display text-3xl text-ink no-underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-6 sm:hidden">
            <Button href={nav.cta.href} className="w-full">
              {nav.cta.label}
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
