import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { dev } from '../content/copy';

/** Dev-only: proves Lenis + ScrollTrigger pinning works (desktop and touch). */
export function DevPin() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to('[data-bar]', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-pin]',
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <section className="grid min-h-svh place-content-center px-[var(--gutter)] text-center">
        <p className="eyebrow text-slate">/dev</p>
        <h1 className="mt-4 text-[length:var(--text-h2)]">{dev.title}</h1>
        <p className="mx-auto mt-4 max-w-[40ch] text-slate">{dev.intro}</p>
      </section>

      <section
        data-pin
        className="grid h-svh place-content-center gap-8 bg-cloud px-[var(--gutter)]"
      >
        <p className="eyebrow text-center text-ink">{dev.pinned}</p>
        <div className="h-px w-[min(60vw,640px)] bg-aluminium">
          <div data-bar className="h-px origin-left scale-x-0 bg-rain" />
        </div>
      </section>

      <section className="grid min-h-svh place-content-center px-[var(--gutter)] text-center">
        <p className="mx-auto max-w-[40ch] text-slate">{dev.after}</p>
      </section>
    </div>
  );
}
