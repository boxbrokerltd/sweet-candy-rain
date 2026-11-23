import { floodFill, findGroups, generateBoard, idx, isPoppable } from '../src/game/board';
import { stageConfig } from '../src/constants/config';
import { scoreForGroup } from '../src/game/rules';

describe('group detection', () => {
  const board = generateBoard(stageConfig(0), 0).board;

  it('returns at least two cells for a real group', () => {
    const groups = findGroups(board, 2);
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0].length).toBeGreaterThanOrEqual(2);
  });

  it('only collects cells of the same colour', () => {
    const groups = findGroups(board, 2);
    const group = groups[0];
    const colour = board[group[0]].color;
    group.forEach(i => expect(board[i].color).toBe(colour));
  });

  it('never returns a crusted cell', () => {
    const groups = findGroups(board, 2);
    groups.forEach(g => g.forEach(i => expect(isPoppable(board[i])).toBe(true)));
  });

  it('scores bigger groups much higher', () => {
    expect(scoreForGroup(2)).toBe(30);
    expect(scoreForGroup(4)).toBe(100);
    expect(scoreForGroup(6)).toBe(210);
    expect(scoreForGroup(1)).toBe(0);
  });

  it('flood fill on an empty index yields nothing', () => {
    expect(floodFill(board, idx(0, 0)).length).toBeGreaterThanOrEqual(1);
  });
});
