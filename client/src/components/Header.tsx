import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useLenis } from 'lenis/react';
import { nav } from '../content/copy';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { headerHold, scrollPage } from '../lib/scrollTo';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { CloseIcon, MenuIcon } from './icons';

/** Scroll this far (px) in one direction before the header reacts. */
const NUDGE = 8;
/** The header never hides this close to the top. */
const HIDE_FROM = 200;

/**
 * Clear at the very top (it floats over the opening can), a mist bar once the page moves.
 * It slides away while the visitor scrolls down, so the films and pinned sections get the
 * whole window, and comes back the moment they scroll up. It stays while the menu is open,
 * while keyboard focus is in it, and while the site scrolls on a link's behalf.
 */
function useHeaderScroll(locked: boolean) {
  const [state, setState] = useState({ hidden: false, atTop: true });
  const lockedRef = useRef(locked);
  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - last;
      const atTop = y < NUDGE;
      setState((s) => {
        let hidden = s.hidden;
        if (atTop || lockedRef.current || performance.now() < headerHold.until) hidden = false;
        else if (dy > NUDGE && y > HIDE_FROM) hidden = true;
        else if (dy < -NUDGE) hidden = false;
        return hidden === s.hidden && atTop === s.atTop ? s : { hidden, atTop };
      });
      // small steps (a smooth scroll) add up until they count as a move
      if (Math.abs(dy) > NUDGE || atTop) last = y;
    };
    const onScroll = () => {
      raf ||= requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const show = () => setState((s) => (s.hidden ? { ...s, hidden: false } : s));
  return { ...state, show };
}

/**
 * The home page's sections name the link they belong to (`data-nav`); the one crossing the
 * middle of the window lights that link, so the header says where you are.
 */
function useSectionInView(pathname: string) {
  const [href, setHref] = useState<string | null>(null);
  useEffect(() => {
    const crossing = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) crossing.add(e.target);
          else crossing.delete(e.target);
        }
        const [first] = crossing;
        setHref(first ? first.getAttribute('data-nav') : null);
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    for (const el of document.querySelectorAll('main [data-nav]')) io.observe(el);
    return () => io.disconnect();
  }, [pathname]);
  return pathname === '/' ? href : null;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const { hidden, atTop, show } = useHeaderScroll(open);
  const inView = useSectionInView(location.pathname);

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

  const onHome = location.pathname === '/';
  // the site scrolls for these itself (RootLayout): stop the router's instant jump
  const glides = (href: string) => href.startsWith('/#') && onHome;
  const toTop = (e: MouseEvent) => {
    if (!onHome || location.hash) return; // the router goes home, RootLayout scrolls
    e.preventDefault();
    setOpen(false);
    scrollPage(lenis, 0);
  };
  const solid = !atTop || open;

  return (
    <header
      data-site-header
      onFocusCapture={show}
      className={`fixed inset-x-0 top-0 z-40 border-b transition-[translate,background-color,border-color] ease-liquid ${
        reduced ? 'duration-0' : 'duration-300'
      } ${hidden ? '-translate-y-full' : ''} ${
        solid ? 'border-aluminium/70 bg-mist/95' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[var(--page-max)] items-center justify-between gap-8 px-[var(--gutter)]">
        <Link
          to="/"
          onClick={toTop}
          preventScrollReset={onHome}
          className="-ml-1 shrink-0 no-underline"
          aria-label={nav.homeLabel}
        >
          <Logo className="h-11 w-auto md:h-14" />
        </Link>

        <nav aria-label={nav.primaryLabel} className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-8">
            {nav.items.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  preventScrollReset={glides(item.href)}
                  className={({ isActive }) =>
                    // a fine underline draws in on hover and stays under the current link
                    `eyebrow relative no-underline transition-colors duration-[var(--dur-ui)] after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-[var(--dur-ui)] after:ease-liquid hover:text-rain-deep hover:after:scale-x-100 ${
                      (isActive && !item.href.includes('#')) || inView === item.href
                        ? 'text-rain-deep after:scale-x-100'
                        : 'text-slate/85 after:scale-x-0'
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
                preventScrollReset={glides(item.href)}
                className={`block py-4 font-display text-3xl no-underline ${
                  inView === item.href || location.pathname === item.href
                    ? 'text-rain-deep'
                    : 'text-ink'
                }`}
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
