import { MAX_SPOILS, stageConfig } from '../src/constants/config';
import { floodFill, generateBoard, idx } from '../src/game/board';
import { evaluateRound, outcomeTitle } from '../src/game/rules';

describe('freshness / spoil meter', () => {
  it('a lone candy forms a group of one', () => {
    const board = generateBoard(stageConfig(0), 0).board;
    board[idx(0, 0)].color = 0;
    board[idx(0, 1)].color = 1;
    board[idx(1, 0)].color = 1;
    expect(floodFill(board, idx(0, 0)).length).toBe(1);
  });

  it('three spoils end the stage as SUGAR SPILLED', () => {
    const cfg = stageConfig(0);
    expect(evaluateRound({ score: 0, moves: 18, spoils: MAX_SPOILS - 1, crustCleared: 0 }, cfg)).toBeNull();
    expect(evaluateRound({ score: 0, moves: 18, spoils: MAX_SPOILS, crustCleared: 0 }, cfg)).toBe('spoil');
    expect(outcomeTitle('spoil')).toBe('SUGAR SPILLED');
  });
});
