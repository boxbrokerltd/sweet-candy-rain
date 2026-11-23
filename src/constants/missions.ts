export type MissionKind = 'score' | 'crust' | 'groups' | 'rain' | 'stars' | 'rainbow';

export type MissionDef = {
  id: string;
  kind: MissionKind;
  title: string;
  description: string;
  target: number;
  seeds: number;
  tokens: number;
};

/** Pool the three active missions are drawn from after every full claim. */
export const MISSION_POOL: MissionDef[] = [
  { id: 'score_1200', kind: 'score', title: 'SUGAR RUSH', description: 'Score 1,200 points across stages.', target: 1200, seeds: 2, tokens: 60 },
  { id: 'score_3000', kind: 'score', title: 'SWEET TOOTH', description: 'Score 3,000 points across stages.', target: 3000, seeds: 4, tokens: 120 },
  { id: 'crust_12', kind: 'crust', title: 'FROST BREAKER', description: 'Crack 12 layers of sugar crust.', target: 12, seeds: 3, tokens: 70 },
  { id: 'crust_30', kind: 'crust', title: 'DEEP THAW', description: 'Crack 30 layers of sugar crust.', target: 30, seeds: 5, tokens: 140 },
  { id: 'groups_25', kind: 'groups', title: 'CHAIN MAKER', description: 'Burst 25 candy groups.', target: 25, seeds: 2, tokens: 50 },
  { id: 'groups_60', kind: 'groups', title: 'BURST MASTER', description: 'Burst 60 candy groups.', target: 60, seeds: 4, tokens: 110 },
  { id: 'rain_3', kind: 'rain', title: 'RAIN DANCER', description: 'Drop candy rain 3 times.', target: 3, seeds: 3, tokens: 80 },
  { id: 'rainbow_2', kind: 'rainbow', title: 'RAINBOW HUNTER', description: 'Set off 2 rainbow drops.', target: 2, seeds: 3, tokens: 90 },
  { id: 'stars_6', kind: 'stars', title: 'STAR HARVEST', description: 'Earn 6 stage stars.', target: 6, seeds: 4, tokens: 100 },
];

export type MissionState = { def: MissionDef; progress: number; claimed: boolean };

/** Deterministic pick of three distinct missions for a given round number. */
export function drawMissions(round: number): MissionState[] {
  const out: MissionState[] = [];
  const used = new Set<number>();
  for (let k = 0; k < 3; k++) {
    let idx = (round * 3 + k * 4 + 1) % MISSION_POOL.length;
    let guard = 0;
    while (used.has(idx) && guard < MISSION_POOL.length) {
      idx = (idx + 1) % MISSION_POOL.length;
      guard++;
    }
    used.add(idx);
    out.push({ def: MISSION_POOL[idx], progress: 0, claimed: false });
  }
  return out;
}
