import { TOTAL_STAGES } from '../src/constants/config';
import {
  DAILY_MOVES,
  EMPTY_DAILY,
  completeDaily,
  dailyFor,
  dayKey,
  dayNumber,
  isDoneToday,
  streakDots,
  timeToNext,
} from '../src/game/daily';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h, 0, 0);

describe('daily challenge generation', () => {
  it('is a pure function of the calendar day', () => {
    const a = dailyFor(at(2026, 11, 23, 9));
    const b = dailyFor(at(2026, 11, 23, 22));
    expect(a).toEqual(b);
  });

  it('changes from one day to the next', () => {
    const keys = [21, 22, 23, 24, 25].map(d => dailyFor(at(2026, 11, d)).key);
    expect(new Set(keys).size).toBe(5);
  });

  it('always yields a playable stage and a sane budget', () => {
    for (let d = 1; d <= 28; d++) {
      const c = dailyFor(at(2026, 11, d));
      expect(c.stageIndex).toBeGreaterThanOrEqual(0);
      expect(c.stageIndex).toBeLessThan(TOTAL_STAGES);
      expect(c.moves).toBeGreaterThan(0);
      expect(c.moves).toBeLessThanOrEqual(DAILY_MOVES);
      expect(c.crustGoal).toBeGreaterThan(0);
      expect(c.twist.title.length).toBeGreaterThan(0);
    }
  });

  it('shortens the budget only on the short-fuse twist', () => {
    for (let d = 1; d <= 28; d++) {
      const c = dailyFor(at(2026, 11, d));
      expect(c.moves).toBe(c.twist.id === 'short-fuse' ? DAILY_MOVES - 4 : DAILY_MOVES);
    }
  });

  it('keys the day as a readable local integer', () => {
    expect(dayKey(at(2026, 11, 23))).toBe(20261123);
    expect(dayNumber(at(2026, 11, 24)) - dayNumber(at(2026, 11, 23))).toBe(1);
  });
});

describe('daily streak', () => {
  it('starts at one and marks today as done', () => {
    const today = at(2026, 11, 23);
    const next = completeDaily(EMPTY_DAILY, today);
    expect(next.streak).toBe(1);
    expect(next.best).toBe(1);
    expect(isDoneToday(next, today)).toBe(true);
    expect(isDoneToday(EMPTY_DAILY, today)).toBe(false);
  });

  it('continues across consecutive days', () => {
    let state = EMPTY_DAILY;
    for (let d = 21; d <= 25; d++) {
      state = completeDaily(state, at(2026, 11, d));
    }
    expect(state.streak).toBe(5);
    expect(state.best).toBe(5);
  });

  it('restarts after a gap but keeps the best', () => {
    let state = EMPTY_DAILY;
    state = completeDaily(state, at(2026, 11, 21));
    state = completeDaily(state, at(2026, 11, 22));
    state = completeDaily(state, at(2026, 11, 25));
    expect(state.streak).toBe(1);
    expect(state.best).toBe(2);
  });

  it('ignores a second completion on the same day', () => {
    const today = at(2026, 11, 23);
    const once = completeDaily(EMPTY_DAILY, today);
    expect(completeDaily(once, today)).toBe(once);
  });

  it('renders seven dots with today last', () => {
    let state = EMPTY_DAILY;
    state = completeDaily(state, at(2026, 11, 22));
    state = completeDaily(state, at(2026, 11, 23));
    const dots = streakDots(state, at(2026, 11, 23));
    expect(dots).toHaveLength(7);
    expect(dots[6]).toBe(true);
    expect(dots[5]).toBe(true);
    expect(dots[4]).toBe(false);
  });

  it('shows no filled dots before the first run', () => {
    expect(streakDots(EMPTY_DAILY, at(2026, 11, 23))).toEqual(new Array(7).fill(false));
  });

  it('counts down to midnight without a negative value', () => {
    expect(timeToNext(at(2026, 11, 23, 18))).toBe('6H 0M');
    expect(timeToNext(at(2026, 11, 23, 23))).toBe('1H 0M');
  });
});
