import { TIMING, stageConfig } from '../src/constants/config';
import { findGroups, generateBoard, largestGroup } from '../src/game/board';

describe('hint pulse', () => {
  it('waits six idle seconds', () => {
    expect(TIMING.idleHint).toBe(6000);
  });

  it('picks the biggest available group', () => {
    const board = generateBoard(stageConfig(1), 0).board;
    const best = largestGroup(board);
    const all = findGroups(board, 2);
    expect(best.length).toBeGreaterThanOrEqual(2);
    all.forEach(g => expect(g.length).toBeLessThanOrEqual(best.length));
  });
});
