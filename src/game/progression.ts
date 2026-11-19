import { TOTAL_STAGES, WORLDS, stageConfig } from '../constants/config';
import { PLANTS } from '../constants/plants';

export type NodeState = 'cleared' | 'unlocked' | 'locked';

export function worldOf(stageIndex: number): number {
  return stageConfig(stageIndex).world;
}

export function clearedCount(stageStars: number[]): number {
  let n = 0;
  for (let i = 0; i < stageStars.length; i++) {
    if (stageStars[i] > 0) n += 1;
  }
  return n;
}

export function totalStars(stageStars: number[]): number {
  let n = 0;
  for (let i = 0; i < stageStars.length; i++) n += stageStars[i];
  return n;
}

export function bloomCount(bloomed: boolean[]): number {
  let n = 0;
  for (let i = 0; i < bloomed.length; i++) {
    if (bloomed[i]) n += 1;
  }
  return n;
}

export function isStageUnlocked(index: number, stageStars: number[], blooms: number): boolean {
  if (index < 0 || index >= TOTAL_STAGES) return false;
  if (index === 0) return true;
  if (stageStars[index] > 0) return true;
  if (stageStars[index - 1] <= 0) return false;
  const world = WORLDS[worldOf(index)];
  return blooms >= world.bloomsNeeded;
}

/** A locked node always explains itself - a tap is never dead. */
export function lockReason(index: number, stageStars: number[], blooms: number): string {
  if (isStageUnlocked(index, stageStars, blooms)) return '';
  const world = WORLDS[worldOf(index)];
  if (stageStars[index - 1] <= 0) return 'CLEAR STAGE ' + index;
  return world.bloomsNeeded + ' BLOOMS';
}

export function nodeState(index: number, stageStars: number[], blooms: number): NodeState {
  if (stageStars[index] > 0) return 'cleared';
  return isStageUnlocked(index, stageStars, blooms) ? 'unlocked' : 'locked';
}

/** The furthest stage the player may start right now. */
export function nextPlayableStage(stageStars: number[], blooms: number): number {
  for (let i = 0; i < TOTAL_STAGES; i++) {
    if (stageStars[i] <= 0 && isStageUnlocked(i, stageStars, blooms)) return i;
  }
  for (let i = TOTAL_STAGES - 1; i >= 0; i--) {
    if (isStageUnlocked(i, stageStars, blooms)) return i;
  }
  return 0;
}

export function hasNextStage(index: number, stageStars: number[], blooms: number): boolean {
  return index + 1 < TOTAL_STAGES && isStageUnlocked(index + 1, stageStars, blooms);
}

export function canPlant(plantId: number, seeds: number, bloomed: boolean[]): boolean {
  const plant = PLANTS[plantId];
  if (!plant || bloomed[plantId]) return false;
  return seeds >= plant.cost;
}

export function worldUnlockNote(): string {
  return '3 BLOOMS UNLOCK CARAMEL CREEK · 7 UNLOCK LOLLIPOP LAGOON';
}
