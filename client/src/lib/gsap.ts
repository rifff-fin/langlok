/**
 * GSAP setup — the only place plugins are registered.
 * Import gsap and plugins from here, never from 'gsap' directly in components.
 * All GSAP plugins (SplitText, DrawSVG, MotionPath) are free for commercial use.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);

// Mobile address-bar show/hide must not re-layout pinned sections.
ScrollTrigger.config({ ignoreMobileResize: true });

// Water, not springs: long liquid eases, no overshoot.
gsap.defaults({ ease: 'power2.out', duration: 0.9 });

export const ease = {
  ui: 'power2.out',
  reveal: 'expo.out',
  drift: 'sine.inOut',
} as const;

export const duration = {
  ui: 0.25,
  reveal: 0.9,
} as const;

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, useGSAP };
