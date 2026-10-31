import { Suspense, useEffect, useState } from 'react';
import { Canvas, advance, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { NeutralToneMapping } from 'three';
import { gsap } from '../lib/gsap';
import { capture } from '../store/configurator';
import { stage, updateTargets } from './stations';
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
      // near/far leave room for the hero dive, where the lid comes most of the way to the lens
      camera={{ fov: 20, near: 40, far: 900, position: [0, 0, 300] }}
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
        <Capture />
      </Suspense>
    </Canvas>
  );
}

/** Page colour under saved previews (the canvas itself is transparent). */
const PREVIEW_GROUND = '#485b27';

/**
 * The configurator's "Save preview": renders the current frame again at a higher pixel
 * ratio and crops the preview box out of it. The pixels are read in the same task as the
 * render, so the drawing buffer needs no preserving; the normal frame is restored at once.
 */
function Capture() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    capture.fn = async (rect) => {
      const ratio = gl.getPixelRatio();
      const sharp = Math.min(3, Math.max(2, ratio));
      gl.setPixelRatio(sharp);
      gl.render(scene, camera);
      const src = gl.domElement;
      const k = src.width / src.clientWidth;
      const out = document.createElement('canvas');
      out.width = Math.round(rect.width * k);
      out.height = Math.round(rect.height * k);
      const x = out.getContext('2d')!;
      x.fillStyle = PREVIEW_GROUND;
      x.fillRect(0, 0, out.width, out.height);
      x.drawImage(
        src,
        rect.left * k,
        rect.top * k,
        out.width,
        out.height,
        0,
        0,
        out.width,
        out.height,
      );
      gl.setPixelRatio(ratio);
      gl.render(scene, camera);
      return new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'));
    };
    return () => {
      capture.fn = null;
    };
  }, [gl, scene, camera]);
  return null;
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
    // the canvas ignores pointer events (the DOM is on top), so listen on the window
    const point = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      stage.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      stage.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    gsap.ticker.add(tick);
    window.addEventListener('pointermove', point, { passive: true });
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', point);
    };
  }, []);
  return null;
}

/**
 * Mounted once textures and models exist: compile shaders up front, then flag the page so
 * CSS fades the stand-in stills out under the live vessels.
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
