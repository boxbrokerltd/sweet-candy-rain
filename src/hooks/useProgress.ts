import { useCallback, useSyncExternalStore } from 'react';
import { ProgressSnapshot, progressStore } from '../game/progressStore';

/** Whole snapshot - for the screens that own a progress view. */
export function useProgress(): ProgressSnapshot {
  return useSyncExternalStore(progressStore.subscribe, progressStore.getState, progressStore.getState);
}

/**
 * Leaf components pull ONE value instead of subscribing to all of the state,
 * so a seed change does not re-render the whole board.
 */
export function useProgressValue<T extends string | number | boolean>(
  selector: (s: ProgressSnapshot) => T,
): T {
  const get = useCallback(() => selector(progressStore.getState()), [selector]);
  return useSyncExternalStore(progressStore.subscribe, get, get);
}

export function useSettings() {
  return useProgress().settings;
}
