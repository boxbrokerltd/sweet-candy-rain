import { MOVES_PER_STAGE, TOTAL_STAGES, stageConfig } from '../src/constants/config';
import { evaluateRound } from '../src/game/rules';

describe('stage configuration and round end', () => {
  it('gives every stage a move budget, a crust goal and a score target', () => {
    for (let i = 0; i < TOTAL_STAGES; i++) {
      const cfg = stageConfig(i);
      expect(cfg.moves).toBe(MOVES_PER_STAGE);
      expect(cfg.crustGoal).toBeGreaterThan(0);
      expect(cfg.scoreTarget).toBeGreaterThan(0);
      expect(cfg.crustTiles).toBe(cfg.crustGoal + 2);
    }
  });

  it('gets harder stage by stage', () => {
    expect(stageConfig(5).scoreTarget).toBeGreaterThan(stageConfig(0).scoreTarget);
    expect(stageConfig(11).crustGoal).toBeGreaterThanOrEqual(stageConfig(0).crustGoal);
  });

  it('ends on the goal, on no moves and on three spoils', () => {
    const cfg = stageConfig(0);
    expect(evaluateRound({ score: 0, moves: 10, spoils: 0, crustCleared: 0 }, cfg)).toBeNull();
    expect(
      evaluateRound({ score: cfg.scoreTarget, moves: 5, spoils: 0, crustCleared: cfg.crustGoal }, cfg),
    ).toBe('harvest');
    expect(evaluateRound({ score: 0, moves: 0, spoils: 0, crustCleared: 0 }, cfg)).toBe('moves');
    expect(evaluateRound({ score: 0, moves: 9, spoils: 3, crustCleared: 0 }, cfg)).toBe('spoil');
  });
});
