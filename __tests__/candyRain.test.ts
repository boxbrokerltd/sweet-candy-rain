import { RAIN_CAP, stageConfig } from '../src/constants/config';
import { generateBoard } from '../src/game/board';
import { addCharge, applyRainCrust, isRainReady, planCandyRain, rainColumns } from '../src/game/boosters';

describe('candy rain booster', () => {
  it('charges with every popped candy and caps at 100', () => {
    expect(addCharge(0, 4)).toBe(16);
    expect(addCharge(90, 10)).toBe(RAIN_CAP);
    expect(isRainReady(99)).toBe(false);
    expect(isRainReady(RAIN_CAP)).toBe(true);
  });

  it('targets the three columns with the most crust', () => {
    const board = generateBoard(stageConfig(8), 0).board;
    const cols = rainColumns(board, 3);
    expect(cols.length).toBe(3);
    expect(new Set(cols).size).toBe(3);
  });

  it('cracks a layer off every crusted cell it hits', () => {
    const board = generateBoard(stageConfig(8), 0).board;
    const plan = planCandyRain(board, 3);
    const result = applyRainCrust(board, plan.crustHits);
    expect(result.cleared).toBe(plan.crustHits.length);
    plan.crustHits.forEach(i => {
      expect(result.board[i].crust).toBe(board[i].crust - 1);
    });
  });
});
