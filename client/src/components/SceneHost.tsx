import { lazy, Suspense, useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { sceneStore } from '../store/scene';
import { useReducedMotion } from '../hooks/useReducedMotion';

// three + R3F + drei live in their own chunk, fetched only when a page has vessel anchors.
const Scene = lazy(() => import('../three/Scene'));

let webgl: boolean | undefined;
function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement('canvas');
      webgl = !!(c.getContext('webgl2') ?? c.getContext('webgl'));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

/**
 * Mounts the 3D scene once a page registers a vessel anchor, then keeps it for later
 * routes. The chunk is fetched when the browser is idle, so it never competes with the
 * hero for the first paint. Without WebGL, or with reduced motion, the photos stay.
 */
export function SceneHost() {
  const reducedMotion = useReducedMotion();
  const wanted = useStore(sceneStore, (s) => Object.keys(s.anchors).length > 0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!wanted || active || reducedMotion || !hasWebGL()) return;
    const go = () => setActive(true);
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(go, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(go, 1200);
    return () => clearTimeout(id);
  }, [wanted, active, reducedMotion]);

  if (!active || reducedMotion) return null;
  return (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
}
