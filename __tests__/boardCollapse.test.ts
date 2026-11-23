import { COLS, ROWS, stageConfig } from '../src/constants/config';
import { EMPTY, collapse, generateBoard, idx, popCells } from '../src/game/board';
import { mulberry32 } from '../src/game/rng';

describe('board collapse and refill', () => {
  it('leaves no empty cell after a pop', () => {
    const board = generateBoard(stageConfig(0), 0).board;
    const popped = popCells(board, [idx(ROWS - 1, 0), idx(ROWS - 2, 0)]);
    expect(popped.board[idx(ROWS - 1, 0)].color).toBe(EMPTY);

    const settled = collapse(popped.board, mulberry32(42));
    for (let i = 0; i < COLS * ROWS; i++) {
      expect(settled[i].color).not.toBe(EMPTY);
    }
  });

  it('keeps the grid size stable', () => {
    const board = generateBoard(stageConfig(2), 1).board;
    const settled = collapse(popCells(board, [idx(3, 3)]).board, mulberry32(7));
    expect(settled.length).toBe(COLS * ROWS);
  });
});
