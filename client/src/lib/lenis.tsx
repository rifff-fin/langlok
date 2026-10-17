import { useEffect, type ReactNode } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { gsap, ScrollTrigger } from './gsap';
import { isRevealed, whenRevealed } from './preloader';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Lenis drives the GSAP ticker so smooth scroll and ScrollTrigger share one clock.
 * Touch scrolling stays native (Lenis default). Off entirely for reduced motion.
 */
function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const tick = (time: number) => lenis.raf(time * 1000);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();
    // the page stays put under the preloader
    if (!isRevealed()) {
      lenis.stop();
      whenRevealed(() => lenis.start());
    }

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return <>{children}</>;

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1 }}>
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
