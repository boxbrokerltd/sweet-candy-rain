import { COLS, ROWS, stageConfig } from '../src/constants/config';
import { generateBoard, isSolvable } from '../src/game/board';
import { mulberry32, seedFor } from '../src/game/rng';

describe('seeded generation', () => {
  it('uses the documented seed formula', () => {
    expect(seedFor(0, 0)).toBe(((0 + 1) * 7919) ^ ((0 + 1) * 104729));
  });

  it('is deterministic for the same seed', () => {
    const a = mulberry32(1234);
    const b = mulberry32(1234);
    expect(a()).toBe(b());
  });

  it('two attempts of the same stage differ', () => {
    const first = generateBoard(stageConfig(3), 0).board;
    const second = generateBoard(stageConfig(3), 1).board;
    let different = 0;
    for (let i = 0; i < COLS * ROWS; i++) {
      if (first[i].color !== second[i].color) different += 1;
    }
    expect(different).toBeGreaterThan(5);
  });

  it('always hands back a playable board', () => {
    for (let stage = 0; stage < 12; stage++) {
      const g = generateBoard(stageConfig(stage), 0);
      expect(g.board.length).toBe(COLS * ROWS);
      expect(g.usedFallback ? true : isSolvable(g.board)).toBe(true);
      expect(g.attempts).toBeLessThanOrEqual(20);
    }
  });
});
