import { drawMissions } from '../src/constants/missions';
import { progressStore } from '../src/game/progressStore';

const report = {
  stageIndex: 0,
  outcome: 'harvest' as const,
  score: 4000,
  crustCleared: 40,
  movesLeft: 9,
  groups: 70,
  rains: 4,
  rainbows: 3,
  stars: 3,
  seedsEarned: 0,
  tokensEarned: 0,
  advanced: [],
};

describe('missions', () => {
  beforeEach(() => progressStore.reset());

  it('draws three distinct missions', () => {
    const set = drawMissions(0);
    expect(set.length).toBe(3);
    expect(new Set(set.map(m => m.def.id)).size).toBe(3);
  });

  it('accumulates progress from a finished stage', () => {
    progressStore.finishStage(report);
    const total = progressStore.getState().missions.reduce((a, m) => a + m.progress, 0);
    expect(total).toBeGreaterThan(0);
  });

  it('pays out a completed mission and refreshes the set when all are claimed', () => {
    progressStore.finishStage(report);
    const before = progressStore.getState().missions.map(m => m.def.id);
    before.forEach(id => progressStore.claimMission(id));
    const after = progressStore.getState().missions;
    expect(after.every(m => !m.claimed)).toBe(true);
    expect(progressStore.getState().seeds).toBeGreaterThan(0);
  });
});
