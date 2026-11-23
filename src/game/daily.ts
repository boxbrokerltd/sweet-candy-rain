/**
 * Daily Challenge: one recipe per calendar day, derived from the local date.
 *
 * Everything here is pure and deterministic - the same day always produces the
 * same stage, budget and twist, on any device, with no clock drift and no
 * network call. The streak is plain integer bookkeeping over day numbers.
 */
import { TOTAL_STAGES, stageConfig } from '../constants/config';
import { mulberry32, randInt } from './rng';

/** Local calendar day as a stable integer: 20261123. Never a timestamp. */
export function dayKey(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/** Day index since the epoch in LOCAL time - used for streak arithmetic. */
export function dayNumber(date: Date): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local.getTime() / 86400000);
}

export type DailyTwist = {
  id: 'double-crust' | 'no-hint' | 'short-fuse' | 'big-groups';
  title: string;
  note: string;
};

export const TWISTS: DailyTwist[] = [
  {
    id: 'double-crust',
    title: 'DOUBLE CRUST',
    note: 'EVERY CRUST TILE NEEDS TWO HITS TODAY',
  },
  {
    id: 'no-hint',
    title: 'NO HINTS',
    note: 'THE HINT PULSE STAYS OFF FOR THIS RUN',
  },
  {
    id: 'short-fuse',
    title: 'SHORT FUSE',
    note: 'FOUR MOVES FEWER THAN THE USUAL STAGE',
  },
  {
    id: 'big-groups',
    title: 'BIG GROUPS',
    note: 'GROUPS OF FIVE OR MORE PAY DOUBLE SCORE',
  },
];

export const DAILY_MOVES = 18;

export type DailyChallenge = {
  key: number;
  stageIndex: number;
  moves: number;
  crustGoal: number;
  scoreTarget: number;
  twist: DailyTwist;
};

/** The whole challenge is a pure function of the calendar day. */
export function dailyFor(date: Date): DailyChallenge {
  const key = dayKey(date);
  const rng = mulberry32(key);
  const stageIndex = randInt(rng, TOTAL_STAGES);
  const twist = TWISTS[randInt(rng, TWISTS.length)];
  const base = stageConfig(stageIndex);
  const moves = twist.id === 'short-fuse' ? DAILY_MOVES - 4 : DAILY_MOVES;
  return {
    key,
    stageIndex,
    moves,
    crustGoal: base.crustGoal,
    scoreTarget: base.scoreTarget,
    twist,
  };
}

export type DailyState = {
  /** dayKey of the last completed challenge, 0 when none. */
  lastKey: number;
  /** dayNumber of the last completed challenge, used for streak continuity. */
  lastDay: number;
  streak: number;
  best: number;
};

export const EMPTY_DAILY: DailyState = { lastKey: 0, lastDay: 0, streak: 0, best: 0 };

export function isDoneToday(state: DailyState, date: Date): boolean {
  return state.lastKey === dayKey(date);
}

/**
 * Completing today's challenge: the streak continues when the previous
 * completion was yesterday, restarts at 1 after any gap, and a second
 * completion on the same day changes nothing.
 */
export function completeDaily(state: DailyState, date: Date): DailyState {
  const key = dayKey(date);
  if (state.lastKey === key) return state;
  const today = dayNumber(date);
  const streak = state.lastDay === today - 1 ? state.streak + 1 : 1;
  return { lastKey: key, lastDay: today, streak, best: Math.max(state.best, streak) };
}

/** The seven dots on the panel: oldest first, today last. */
export function streakDots(state: DailyState, date: Date): boolean[] {
  const today = dayNumber(date);
  const filledFrom = today - state.streak + (isDoneToday(state, date) ? 1 : 0);
  const dots: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = today - i;
    dots.push(state.streak > 0 && day >= filledFrom && day <= state.lastDay);
  }
  return dots;
}

/** Hours and minutes left until the next challenge unlocks, as `6H 12M`. */
export function timeToNext(date: Date): string {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const ms = Math.max(0, next.getTime() - date.getTime());
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h + 'H ' + m + 'M';
}
