import { lazy, Suspense, useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { isRevealed } from '../lib/preloader';
import { hasWebGL } from '../lib/webgl';
import { sceneStore } from '../store/scene';

// three + R3F + drei live in their own chunk, fetched only when a page has vessel anchors.
const Scene = lazy(() => import('../three/Scene'));

/**
 * Mounts the 3D scene once a page registers a vessel anchor, then keeps it for later
 * routes. The chunk is fetched when the browser is idle, so it never competes with the
 * first paint (the plates show studio stills of the same vessels meanwhile); under the home
 * page's preloader it is fetched at once, since the preloader waits for it. Reduced
 * motion still gets the live vessels, only without drift, glides, pins or the dive.
 * Without WebGL the stills stay.
 */
export function SceneHost() {
  const wanted = useStore(sceneStore, (s) => Object.keys(s.anchors).length > 0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!wanted || active || !hasWebGL()) return;
    const go = () => setActive(true);
    // under the preloader nothing competes with it: the live can is what it waits for
    if (!isRevealed()) {
      go();
      return;
    }
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(go, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(go, 1000);
    return () => clearTimeout(id);
  }, [wanted, active]);

  if (!active) return null;
  return (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
}
