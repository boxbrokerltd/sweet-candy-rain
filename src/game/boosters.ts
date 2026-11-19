import { COLS, RAIN_CAP, RAIN_PER_CANDY, RAINBOW_GROUP, ROWS } from '../constants/config';
import { Board, cellsOfColor, colOf, dominantColor, idx, isPoppable } from './board';

export function chargeFor(popped: number): number {
  return popped * RAIN_PER_CANDY;
}

export function addCharge(current: number, popped: number): number {
  return Math.min(RAIN_CAP, current + chargeFor(popped));
}

export function isRainReady(charge: number): boolean {
  return charge >= RAIN_CAP;
}

/** A burst of 5 or more leaves a Rainbow Drop behind. */
export function earnsRainbow(groupSize: number): boolean {
  return groupSize >= RAINBOW_GROUP;
}

/** The three columns carrying the most crust take the rain. */
export function rainColumns(board: Board, count: number): number[] {
  const weight: { col: number; crust: number }[] = [];
  for (let c = 0; c < COLS; c++) {
    let crust = 0;
    for (let r = 0; r < ROWS; r++) crust += board[idx(r, c)].crust;
    weight.push({ col: c, crust });
  }
  weight.sort((a, b) => (b.crust - a.crust) || (a.col - b.col));
  return weight.slice(0, count).map(w => w.col);
}

export type RainPlan = { columns: number[]; crustHits: number[]; popCells: number[] };

/**
 * Candy rain: every cell in the chosen columns loses a crust layer and every
 * loose candy there pops. Costs no move, resets the charge to 0.
 */
export function planCandyRain(board: Board, columnCount: number): RainPlan {
  const columns = rainColumns(board, columnCount);
  const colSet = new Set(columns);
  const crustHits: number[] = [];
  const pops: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (!colSet.has(colOf(i))) continue;
    if (board[i].crust > 0) crustHits.push(i);
    else if (isPoppable(board[i])) pops.push(i);
  }
  return { columns, crustHits, popCells: pops };
}

export function applyRainCrust(board: Board, crustHits: number[]): { board: Board; cleared: number } {
  const next = board.map(c => ({ ...c, fall: 0 }));
  let cleared = 0;
  for (let k = 0; k < crustHits.length; k++) {
    const i = crustHits[k];
    if (next[i].crust > 0) {
      next[i].crust -= 1;
      cleared += 1;
    }
  }
  return { board: next, cleared };
}

/** A Rainbow Drop clears every candy of the board's most numerous colour. */
export function planRainbowDrop(board: Board, at: number): number[] {
  const colour = dominantColor(board);
  const cells = cellsOfColor(board, colour);
  if (cells.indexOf(at) === -1) cells.push(at);
  return cells;
}
