import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigationType } from 'react-router';
import { useLenis } from 'lenis/react';
import { nav } from '../content/copy';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MotionSwitch } from '../components/MotionSwitch';
import { SceneHost } from '../components/SceneHost';
import { useReveals } from '../hooks/useReveals';
import { ScrollTrigger } from '../lib/gsap';
import { runPreloader, whenRevealed } from '../lib/preloader';
import { scrollPage, settleLenis } from '../lib/scrollTo';

export function RootLayout() {
  const { hash, pathname, key } = useLocation();
  const main = useRef<HTMLElement>(null);
  useReveals(main, pathname);

  // Anchors (/#products) and links back to the page you are on (the logo on the home page).
  // Runs on every navigation, also to the same URL, and waits until the page has settled:
  // the preloader, the fonts and the pin spacing all move the target. Links on the same page
  // glide; arriving from another page jumps. A new page without an anchor opens at the top
  // (or, going back, where it was): Lenis is told at once, or a glide still running would
  // carry on into the new page.
  const navType = useNavigationType();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    const samePage = lastPath.current === pathname;
    lastPath.current = pathname;
    if (!hash && !samePage) {
      if (navType === 'POP')
        settleLenis(lenisRef.current); // keep the restored position
      else scrollPage(lenisRef.current, 0, { immediate: true });
      return;
    }
    let cancelled = false;
    whenRevealed(() => {
      void document.fonts.ready.then(() =>
        requestAnimationFrame(() => {
          if (cancelled) return;
          ScrollTrigger.refresh();
          const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : 0;
          if (target !== null) scrollPage(lenisRef.current, target, { immediate: !samePage });
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [key, hash, pathname, navType]);

  // Web fonts reflow text after first paint; re-measure every trigger once they land.
  useEffect(() => {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // The home page's preloader (index.html) fills and lifts once the first screen is ready.
  useEffect(() => {
    void runPreloader();
  }, []);

  return (
    <>
      <a
        href="#main"
        className="eyebrow sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:text-ink"
      >
        {nav.skipLink}
      </a>
      <Header />
      {/* The single WebGL canvas (fixed, z 0) sits under main and the footer (z 1). */}
      <SceneHost />
      <main ref={main} id="main" tabIndex={-1} className="relative z-[1] outline-none">
        <Outlet />
      </main>
      <Footer />
      <MotionSwitch />
      {/* Scroll positions belong to history entries, so Back and Forward return where you
          were and a link opens a page at the top. A fresh document load has the key
          "default" on every page, so those are keyed by path instead. */}
      <ScrollRestoration
        getKey={(location) => (location.key === 'default' ? location.pathname : location.key)}
      />
    </>
  );
}
