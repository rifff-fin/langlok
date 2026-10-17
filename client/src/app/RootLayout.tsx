import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { nav } from '../content/copy';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MotionSwitch } from '../components/MotionSwitch';
import { SceneHost } from '../components/SceneHost';
import { useReveals } from '../hooks/useReveals';
import { ScrollTrigger } from '../lib/gsap';
import { runPreloader } from '../lib/preloader';

export function RootLayout() {
  const { hash, pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  useReveals(main, pathname);

  // Router doesn't scroll to #anchors on its own (e.g. /#products from another page).
  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [hash, pathname]);

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
      {/* Key by pathname: every fresh document load shares location.key "default". */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </>
  );
}
