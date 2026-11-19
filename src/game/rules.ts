import { MAX_SPOILS, StageConfig } from '../constants/config';

export type Outcome = 'harvest' | 'moves' | 'spoil';

export type RoundState = {
  score: number;
  moves: number;
  spoils: number;
  crustCleared: number;
};

/** Bigger groups pay much more: 2 -> 30, 4 -> 100, 6 -> 210, 9 -> 450. */
export function scoreForGroup(n: number): number {
  if (n < 2) return 0;
  return n * (n + 1) * 5;
}

export function goalReached(state: RoundState, cfg: StageConfig): boolean {
  return state.crustCleared >= cfg.crustGoal && state.score >= cfg.scoreTarget;
}

/** null means the round continues. */
export function evaluateRound(state: RoundState, cfg: StageConfig): Outcome | null {
  if (goalReached(state, cfg)) return 'harvest';
  if (state.spoils >= MAX_SPOILS) return 'spoil';
  if (state.moves <= 0) return 'moves';
  return null;
}

export function starsFor(outcome: Outcome, movesLeft: number): number {
  if (outcome !== 'harvest') return 0;
  if (movesLeft >= 8) return 3;
  if (movesLeft >= 4) return 2;
  return 1;
}

/** The result screen speaks the game's own words, never "You win". */
export function outcomeTitle(outcome: Outcome): string {
  if (outcome === 'harvest') return 'GARDEN HARVEST!';
  if (outcome === 'moves') return 'OUT OF MOVES';
  return 'SUGAR SPILLED';
}

export function outcomeNote(outcome: Outcome): string {
  if (outcome === 'harvest') return 'THE GARDEN DRANK THE SUGAR RAIN';
  if (outcome === 'moves') return 'THE BOARD RAN DRY BEFORE THE GOAL';
  return 'THREE LONE CANDIES SPOILED THE BATCH';
}

export function goalText(state: RoundState, cfg: StageConfig): string {
  const crust = Math.min(state.crustCleared, cfg.crustGoal);
  return 'CRUST ' + crust + '/' + cfg.crustGoal + ' · SCORE ' + state.score + '/' + cfg.scoreTarget;
}
