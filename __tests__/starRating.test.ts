import { TOTAL_STAGES } from '../src/constants/config';
import { starsFor } from '../src/game/rules';
import { progressStore } from '../src/game/progressStore';

describe('star rating and seed harvest', () => {
  beforeEach(() => progressStore.reset());

  it('rewards leftover moves', () => {
    expect(starsFor('harvest', 9)).toBe(3);
    expect(starsFor('harvest', 5)).toBe(2);
    expect(starsFor('harvest', 1)).toBe(1);
    expect(starsFor('moves', 9)).toBe(0);
    expect(starsFor('spoil', 9)).toBe(0);
  });

  it('turns stars into seeds and keeps the best result', () => {
    const base = {
      stageIndex: 0,
      outcome: 'harvest' as const,
      score: 900,
      crustCleared: 6,
      movesLeft: 9,
      groups: 8,
      rains: 0,
      rainbows: 0,
      stars: 3,
      seedsEarned: 0,
      tokensEarned: 0,
      advanced: [],
    };
    const out = progressStore.finishStage(base);
    expect(out.seedsEarned).toBe(3);
    expect(progressStore.getState().seeds).toBe(3);
    expect(progressStore.getState().stageStars[0]).toBe(3);

    progressStore.finishStage({ ...base, stars: 1 });
    expect(progressStore.getState().stageStars[0]).toBe(3);
    expect(progressStore.getState().stageStars.length).toBe(TOTAL_STAGES);
  });
});
