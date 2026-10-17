import type { RefObject } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { motionQuery } from '../lib/motion';
import { isRevealed, whenRevealed } from '../lib/preloader';

/**
 * Editorial scroll reveals for a page, set up from markup alone:
 *   h2, [data-reveal="lines"]   lines rise out of a mask (SplitText, re-split on resize);
 *                               h2[data-reveal="off"] is animated by its section instead
 *   [data-reveal="intro"]       same, on load (hero headline; after the preloader lifts)
 *   [data-chapter-head]         hairline draws left to right, number and label follow
 *   [data-reveal="fade"]        fades up
 *   [data-reveal="stagger"]     its children fade up in turn
 * Reduced motion: nothing runs, content is simply there.
 */
export function useReveals(scope: RefObject<HTMLElement | null>, key: string) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      gsap.matchMedia().add(motionQuery(), () => {
        const lines = (el: HTMLElement, onLoad: boolean) =>
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) => {
              const rise = gsap.from(self.lines, {
                yPercent: 105,
                duration: onLoad ? 1.2 : 1,
                delay: onLoad ? 0.15 : 0,
                ease: 'expo.out',
                stagger: 0.09,
                paused: onLoad && !isRevealed(),
                scrollTrigger: onLoad ? undefined : { trigger: el, start: 'top 88%', once: true },
              });
              // the opening headline rises as the preloader lifts, not behind it
              if (onLoad) whenRevealed(() => rise.play());
              return rise;
            },
          });

        root
          .querySelectorAll<HTMLElement>('[data-reveal="intro"]')
          .forEach((el) => lines(el, true));
        root
          .querySelectorAll<HTMLElement>('h2:not([data-reveal="off"]), [data-reveal="lines"]')
          .forEach((el) => lines(el, false));

        root.querySelectorAll<HTMLElement>('[data-chapter-head]').forEach((el) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
          tl.from(el.querySelector('hr'), {
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 1.2,
            ease: 'expo.out',
          }).from(
            el.querySelectorAll('[data-chapter-label] > *'),
            { autoAlpha: 0, x: -12, stagger: 0.07, duration: 0.7, ease: 'power2.out' },
            0.2,
          );
        });

        root.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 28,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });

        root.querySelectorAll<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
          gsap.from(el.children, {
            autoAlpha: 0,
            y: 32,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          });
        });
      });
    },
    { scope, dependencies: [key], revertOnUpdate: true },
  );
}
