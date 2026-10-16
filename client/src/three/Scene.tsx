import { Suspense, useEffect, useState } from 'react';
import { Canvas, advance, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { NeutralToneMapping } from 'three';
import { gsap } from '../lib/gsap';
import { updateTargets } from './stations';
import { Lighting } from './Lighting';
import { Bottle, Can } from './Vessels';

/**
 * The site's single WebGL canvas: fixed, full-viewport, transparent, behind the DOM
 * (main sits above it at z-index 1, so section backgrounds naturally cover the vessels).
 *
 * One clock: the GSAP ticker already runs Lenis and ScrollTrigger, so the 3D frame is
 * rendered from the same tick, after scroll and pins are updated (no one-frame lag behind
 * the DOM). The loop sleeps whenever no vessel is on screen.
 */
export default function Scene() {
  const [dpr, setDpr] = useState(1.75);
  return (
    <Canvas
      aria-hidden="true"
      frameloop="never"
      dpr={[1, dpr]}
      camera={{ fov: 20, near: 100, far: 600, position: [0, 0, 300] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      <Driver />
      <PerformanceMonitor onDecline={() => setDpr(1.25)} onIncline={() => setDpr(1.75)} />
      <Lighting />
      <Suspense fallback={null}>
        <Can />
        <Bottle />
        <Ready />
      </Suspense>
    </Canvas>
  );
}

function Driver() {
  useEffect(() => {
    let wasVisible = false;
    const tick = (time: number) => {
      const visible = updateTargets(window.innerWidth, window.innerHeight);
      // render while anything is on screen, plus one frame to clear when it leaves
      if (visible || wasVisible) advance(time);
      wasVisible = visible;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return null;
}

/**
 * Mounted once textures and models exist: compile shaders up front, then flag the page so
 * CSS fades the stand-in product photos out over the live vessels.
 */
function Ready() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.compile(scene, camera);
    const root = document.documentElement;
    root.dataset.webgl = 'ready';
    return () => {
      delete root.dataset.webgl;
    };
  }, [gl, scene, camera]);
  return null;
}
