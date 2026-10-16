import { Outlet, ScrollRestoration } from 'react-router';
import { nav } from '../content/copy';

export function RootLayout() {
  return (
    <>
      <a
        href="#main"
        className="eyebrow sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:text-ink"
      >
        {nav.skipLink}
      </a>
      <main id="main">
        <Outlet />
      </main>
      {/* Key by pathname: every fresh document load shares location.key "default". */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </>
  );
}
