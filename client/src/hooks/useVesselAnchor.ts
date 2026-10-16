import { useCallback } from 'react';
import { registerAnchor, type AnchorId } from '../store/scene';

/** Ref callback that registers an element as a 3D vessel anchor (and unregisters on unmount). */
export function useVesselAnchor(id: AnchorId | undefined) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (!id) return;
      registerAnchor(id, el);
      return () => registerAnchor(id, null);
    },
    [id],
  );
}
