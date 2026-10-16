import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { nav } from '../content/copy';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function RootLayout() {
  const { hash, pathname } = useLocation();

  // Router doesn't scroll to #anchors on its own (e.g. /#products from another page).
  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [hash, pathname]);

  return (
    <>
      <a
        href="#main"
        className="eyebrow sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:text-ink"
      >
        {nav.skipLink}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      {/* Key by pathname: every fresh document load shares location.key "default". */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </>
  );
}
