import { useSyncExternalStore } from 'react';
import { reducedQuery } from '../lib/motion';

const QUERY = reducedQuery();

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** True when motion is reduced (OS setting, or the visitor's Motion switch). Updates live. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
