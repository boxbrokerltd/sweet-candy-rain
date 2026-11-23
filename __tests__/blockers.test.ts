import { ROWS, stageConfig } from '../src/constants/config';
import { crustLayersLeft, generateBoard, idx, isPoppable, popCells } from '../src/game/board';

describe('sugar crust blockers', () => {
  it('cracks one layer off each neighbour of a pop', () => {
    const board = generateBoard(stageConfig(4), 0).board;
    board[idx(3, 3)].crust = 2;
    board[idx(3, 2)].crust = 0;
    const before = board[idx(3, 3)].crust;
    const result = popCells(board, [idx(3, 2)]);
    expect(result.board[idx(3, 3)].crust).toBe(before - 1);
    expect(result.crustCleared).toBeGreaterThanOrEqual(1);
  });

  it('a crusted cell cannot be popped', () => {
    const board = generateBoard(stageConfig(4), 0).board;
    board[idx(2, 2)].crust = 1;
    expect(isPoppable(board[idx(2, 2)])).toBe(false);
  });

  it('the stage starts with crust to clear', () => {
    const board = generateBoard(stageConfig(6), 0).board;
    expect(crustLayersLeft(board)).toBeGreaterThanOrEqual(stageConfig(6).crustTiles);
    expect(board.length / ROWS).toBeGreaterThan(0);
  });
});
