import { useEffect, useState } from 'react';
import { TIMING } from '../constants/config';
import { Board, largestGroup } from '../game/board';

/**
 * After 6 idle seconds the biggest available group breathes twice.
 * Returns an empty list when the setting is off or the board is busy.
 */
export function useHintPulse(board: Board, enabled: boolean, active: boolean): number[] {
  const [hint, setHint] = useState<number[]>([]);

  useEffect(() => {
    setHint([]);
    if (!enabled || !active) return undefined;
    const id = setTimeout(() => setHint(largestGroup(board)), TIMING.idleHint);
    return () => clearTimeout(id);
  }, [board, enabled, active]);

  return hint;
}

export default useHintPulse;
