import { stageConfig } from '../src/constants/config';
import { dominantColor, generateBoard, idx, placeRainbow } from '../src/game/board';
import { earnsRainbow, planRainbowDrop } from '../src/game/boosters';

describe('rainbow drop', () => {
  it('is earned by a burst of five or more', () => {
    expect(earnsRainbow(4)).toBe(false);
    expect(earnsRainbow(5)).toBe(true);
  });

  it('marks the tapped cell as a rainbow', () => {
    const board = generateBoard(stageConfig(0), 0).board;
    const next = placeRainbow(board, idx(2, 2));
    expect(next[idx(2, 2)].rainbow).toBe(true);
  });

  it('clears every candy of the most numerous colour', () => {
    const board = generateBoard(stageConfig(0), 0).board;
    const colour = dominantColor(board);
    const cells = planRainbowDrop(board, idx(0, 0));
    expect(cells.length).toBeGreaterThan(0);
    cells.forEach(i => {
      if (i !== idx(0, 0)) expect(board[i].color).toBe(colour);
    });
  });
});
