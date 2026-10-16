import { Helmet } from 'react-helmet-async';
import { hero, products, site } from '../content/copy';

/** Phase 0 holding page: proves tokens, fonts and assets. Phase 1 replaces it with the sections. */
export function Home() {
  const opening = hero.beats[0];

  return (
    <>
      <Helmet>
        <title>{`${site.brand} — ${site.tagline}`}</title>
      </Helmet>

      <section className="mx-auto grid min-h-svh max-w-[var(--page-max)] items-center gap-12 px-[var(--gutter)] py-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="eyebrow text-slate">01 · Sky</p>
          <h1 className="mt-6 text-[length:var(--text-h2)] text-ink">{opening.title}</h1>
          <p className="mt-6 max-w-[34ch] text-slate">{opening.sub}</p>
          <hr className="mt-10 border-0 border-t border-aluminium" />
          <p className="eyebrow mt-6 text-rain-deep">{site.manufactured}</p>
        </div>
        <img
          src="/img/mockups/can-front.jpeg"
          alt={products.can.imageAlt}
          width={579}
          height={1024}
          fetchPriority="high"
          className="mx-auto w-full max-w-[300px] md:col-span-5"
        />
      </section>
    </>
  );
}
