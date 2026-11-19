import { Dimensions } from 'react-native';

/**
 * Splash hold. EXACTLY 8000 ms — timer driven, automatic, no tap-to-skip.
 * Shorter values race the QA screenshot window (4500/6000/6500 all failed).
 */
export const LOADER_DURATION_MS = 8000;

export const APP_VERSION = '1.0.0';
export const BRAND_NAME = 'CANDY CURRENT';
export const BRAND_TAGLINE = 'SWEET CANDY RAIN';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
export { SCREEN_W, SCREEN_H };

export const HEADER_TOP = 44;
export const HEADER_H = 72;

/* ---- Board geometry (CODE RULE 4/5: frame = padding + border) ---- */
export const COLS = 7;
export const ROWS = 8;
const BOARD_PAD = 6;
const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER; // 8
export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);

/** Room left for header + goal strip + hint + the floating control bar. */
const BOARD_MAX_H = SCREEN_H - (HEADER_TOP + HEADER_H) - 44 - 26 - 124 - 16;

export const TILE = Math.max(
  34,
  Math.min(
    Math.floor((BOARD_MAX_W - 2 * BOARD_FRAME) / COLS),
    Math.floor((BOARD_MAX_H - 2 * BOARD_FRAME) / ROWS),
  ),
);
export const BOARD_W = TILE * COLS + 2 * BOARD_FRAME;
export const BOARD_H = TILE * ROWS + 2 * BOARD_FRAME;
export const BOARD_PADDING = BOARD_PAD;
export const BOARD_BORDER_W = BOARD_BORDER;

/* ---- Stage rules ---- */
export const TOTAL_STAGES = 12;
export const MOVES_PER_STAGE = 20;
export const MAX_SPOILS = 3;
export const RAIN_CAP = 100;
export const RAIN_PER_CANDY = 4;
export const RAINBOW_GROUP = 5;

export type StageConfig = {
  index: number;
  moves: number;
  crustGoal: number;
  scoreTarget: number;
  crustTiles: number;
  doubleCrustRatio: number;
  world: number;
};

export function stageConfig(index: number): StageConfig {
  const i = Math.max(0, Math.min(TOTAL_STAGES - 1, index));
  const crustGoal = Math.min(4 + i * 2, 18);
  return {
    index: i,
    moves: MOVES_PER_STAGE,
    crustGoal,
    scoreTarget: 600 + i * 150,
    crustTiles: crustGoal + 2,
    doubleCrustRatio: i >= 8 ? 0.4 : i >= 4 ? 0.25 : 0,
    world: i < 4 ? 0 : i < 8 ? 1 : 2,
  };
}

export const WORLDS = [
  { name: 'MARSHMALLOW MEADOW', tint: '#FF69B4', bloomsNeeded: 0, first: 0 },
  { name: 'CARAMEL CREEK', tint: '#FFA23A', bloomsNeeded: 3, first: 4 },
  { name: 'LOLLIPOP LAGOON', tint: '#5B8FF9', bloomsNeeded: 7, first: 8 },
];

/* ---- Animation timings ---- */
export const TIMING = {
  pop: 220,
  fall: 320,
  fallGentle: 120,
  stagger: 24,
  spoil: 240,
  rain: 700,
  winHandoff: 700,
  loseHandoff: 600,
  screenFade: 240,
  screenFadeGentle: 120,
  idleHint: 6000,
};

/* ---- Rewards chests (virtual only) ---- */
export const CHESTS = [
  { id: 0, stars: 3, seeds: 3, tokens: 40, headStart: false },
  { id: 1, stars: 8, seeds: 5, tokens: 80, headStart: false },
  { id: 2, stars: 15, seeds: 8, tokens: 150, headStart: true },
  { id: 3, stars: 24, seeds: 12, tokens: 240, headStart: true },
];
