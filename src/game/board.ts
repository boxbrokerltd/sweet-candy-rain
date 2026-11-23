import { COLS, ROWS, StageConfig } from '../constants/config';
import { mulberry32, randInt, Rng, seedFor, shuffle } from './rng';

export const COLOR_COUNT = 5;
export const EMPTY = -1;

export type Cell = {
  id: number;
  color: number; // 0..4, or EMPTY while the board is resolving
  crust: number; // 0 | 1 | 2
  rainbow: boolean;
  fall: number; // rows this cell dropped in the last collapse (animation only)
};

export type Board = Cell[]; // length COLS*ROWS, index = row * COLS + col

export const idx = (row: number, col: number) => row * COLS + col;
export const rowOf = (i: number) => Math.floor(i / COLS);
export const colOf = (i: number) => i % COLS;

let nextId = 1;
export function newCellId(): number {
  nextId += 1;
  return nextId;
}
export function resetCellIds(): void {
  nextId = 1;
}

function makeCell(color: number, crust: number): Cell {
  return { id: newCellId(), color, crust, rainbow: false, fall: 0 };
}

export function neighbours(i: number): number[] {
  const r = rowOf(i);
  const c = colOf(i);
  const out: number[] = [];
  if (r > 0) out.push(idx(r - 1, c));
  if (r < ROWS - 1) out.push(idx(r + 1, c));
  if (c > 0) out.push(idx(r, c - 1));
  if (c < COLS - 1) out.push(idx(r, c + 1));
  return out;
}

/** A cell only joins a group when it is a plain, uncrusted candy. */
export function isPoppable(cell: Cell | undefined): boolean {
  return !!cell && cell.color !== EMPTY && cell.crust === 0 && !cell.rainbow;
}

/** Orthogonally connected region of the same colour (flood fill). */
export function floodFill(board: Board, start: number): number[] {
  const origin = board[start];
  if (!isPoppable(origin)) return [];
  const colour = origin.color;
  const seen = new Set<number>([start]);
  const stack = [start];
  const out: number[] = [];
  while (stack.length > 0) {
    const i = stack.pop() as number;
    out.push(i);
    const near = neighbours(i);
    for (let k = 0; k < near.length; k++) {
      const n = near[k];
      if (seen.has(n)) continue;
      const cell = board[n];
      if (isPoppable(cell) && cell.color === colour) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return out;
}

/** All groups of size >= minSize currently available on the board. */
export function findGroups(board: Board, minSize: number): number[][] {
  const seen = new Set<number>();
  const groups: number[][] = [];
  for (let i = 0; i < board.length; i++) {
    if (seen.has(i) || !isPoppable(board[i])) continue;
    const g = floodFill(board, i);
    for (let k = 0; k < g.length; k++) seen.add(g[k]);
    if (g.length >= minSize) groups.push(g);
  }
  return groups;
}

export function largestGroup(board: Board): number[] {
  const groups = findGroups(board, 2);
  let best: number[] = [];
  for (let i = 0; i < groups.length; i++) {
    if (groups[i].length > best.length) best = groups[i];
  }
  return best;
}

export type PopResult = { board: Board; crustCleared: number; popped: number };

/**
 * Removes the given cells and cracks one crust layer off each orthogonal
 * neighbour. Every removed layer counts toward the stage goal.
 */
export function popCells(board: Board, cells: number[]): PopResult {
  const next = board.map(c => ({ ...c, fall: 0 }));
  let crustCleared = 0;
  const popSet = new Set(cells);
  for (let k = 0; k < cells.length; k++) {
    const near = neighbours(cells[k]);
    for (let n = 0; n < near.length; n++) {
      const t = near[n];
      if (popSet.has(t)) continue;
      if (next[t].crust > 0) {
        next[t].crust -= 1;
        crustCleared += 1;
      }
    }
  }
  for (let k = 0; k < cells.length; k++) {
    // A popped cell becomes a plain hole: it can never stay frosted.
    next[cells[k]].color = EMPTY;
    next[cells[k]].rainbow = false;
    next[cells[k]].crust = 0;
  }
  return { board: next, crustCleared, popped: cells.length };
}

/** Marks one cell as a Rainbow Drop (the reward for a burst of 5 or more). */
export function placeRainbow(board: Board, at: number): Board {
  const next = board.slice();
  const cell = next[at];
  if (!cell) return next;
  next[at] = {
    id: newCellId(),
    color: cell.color === EMPTY ? 0 : cell.color,
    crust: 0,
    rainbow: true,
    fall: 0,
  };
  return next;
}

/**
 * Packs one crust-free stretch of a column towards its bottom and tops the
 * rest up with fresh candies, so no hole is ever left behind.
 */
function packSegment(next: Board, c: number, top: number, bottom: number, rng: Rng): void {
  let write = bottom;
  for (let r = bottom; r >= top; r--) {
    const cell = next[idx(r, c)];
    if (cell.color === EMPTY) continue;
    if (write !== r) {
      next[idx(write, c)] = { ...cell, fall: write - r };
      next[idx(r, c)] = { id: newCellId(), color: EMPTY, crust: 0, rainbow: false, fall: 0 };
    }
    write -= 1;
  }
  for (let r = write; r >= top; r--) {
    next[idx(r, c)] = {
      id: newCellId(),
      color: randInt(rng, COLOR_COUNT),
      crust: 0,
      rainbow: false,
      fall: r - top + 1,
    };
  }
}

/** Gravity + refill. A crusted cell is frozen and splits its column in two. */
export function collapse(board: Board, rng: Rng): Board {
  const next = board.map(c => ({ ...c, fall: 0 }));
  for (let c = 0; c < COLS; c++) {
    let segBottom = ROWS - 1;
    for (let r = ROWS - 1; r >= -1; r--) {
      const barrier = r < 0 || next[idx(r, c)].crust > 0;
      if (!barrier) continue;
      const segTop = r + 1;
      if (segBottom >= segTop) packSegment(next, c, segTop, segBottom, rng);
      segBottom = r - 1;
    }
  }
  return next;
}

export function countColors(board: Board): number[] {
  const counts = [0, 0, 0, 0, 0];
  for (let i = 0; i < board.length; i++) {
    const cell = board[i];
    if (isPoppable(cell)) counts[cell.color] += 1;
  }
  return counts;
}

export function dominantColor(board: Board): number {
  const counts = countColors(board);
  let best = 0;
  for (let i = 1; i < counts.length; i++) {
    if (counts[i] > counts[best]) best = i;
  }
  return best;
}

export function crustLayersLeft(board: Board): number {
  let total = 0;
  for (let i = 0; i < board.length; i++) total += board[i].crust;
  return total;
}

export function cellsOfColor(board: Board, color: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (isPoppable(board[i]) && board[i].color === color) out.push(i);
  }
  return out;
}

/* ------------------------- generation ------------------------- */

function rawBoard(cfg: StageConfig, rng: Rng): Board {
  const board: Board = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    board.push(makeCell(randInt(rng, COLOR_COUNT), 0));
  }
  const all: number[] = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    if (rowOf(i) >= 1) all.push(i);
  }
  const slots = shuffle(rng, all).slice(0, cfg.crustTiles);
  for (let k = 0; k < slots.length; k++) {
    board[slots[k]].crust = rng() < cfg.doubleCrustRatio ? 2 : 1;
  }
  return board;
}

/** A layout is playable when it offers groups and every crust can be reached. */
export function isSolvable(board: Board): boolean {
  if (findGroups(board, 2).length < 3) return false;
  for (let i = 0; i < board.length; i++) {
    if (board[i].crust === 0) continue;
    const near = neighbours(i);
    let reachable = false;
    for (let k = 0; k < near.length; k++) {
      if (isPoppable(board[near[k]])) {
        reachable = true;
        break;
      }
    }
    if (!reachable) return false;
  }
  return true;
}

/** Guaranteed-playable fallback used when 20 regenerations all failed. */
export function fallbackBoard(cfg: StageConfig): Board {
  const board: Board = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      board.push(makeCell(Math.floor(c / 2) % COLOR_COUNT, 0));
    }
  }
  let placed = 0;
  for (let r = 2; r < ROWS && placed < cfg.crustTiles; r += 2) {
    for (let c = 1; c < COLS && placed < cfg.crustTiles; c += 3) {
      board[idx(r, c)].crust = cfg.doubleCrustRatio > 0 && placed % 4 === 3 ? 2 : 1;
      placed += 1;
    }
  }
  return board;
}

export type Generated = { board: Board; seed: number; attempts: number; usedFallback: boolean };

export function generateBoard(cfg: StageConfig, attempt: number): Generated {
  const seed = seedFor(cfg.index, attempt);
  const rng = mulberry32(seed);
  for (let tries = 1; tries <= 20; tries++) {
    const candidate = rawBoard(cfg, rng);
    if (isSolvable(candidate)) {
      return { board: candidate, seed, attempts: tries, usedFallback: false };
    }
  }
  return { board: fallbackBoard(cfg), seed, attempts: 20, usedFallback: true };
}
