import { TOTAL_STAGES } from '../src/constants/config';
import { isStageUnlocked, lockReason, nextPlayableStage, nodeState } from '../src/game/progression';

describe('level map unlocking', () => {
  const none = new Array(TOTAL_STAGES).fill(0);

  it('starts with stage 1 unlocked only', () => {
    expect(isStageUnlocked(0, none, 0)).toBe(true);
    expect(isStageUnlocked(1, none, 0)).toBe(false);
  });

  it('unlocks the next stage once the previous one is cleared', () => {
    const stars = none.slice();
    stars[0] = 2;
    expect(isStageUnlocked(1, stars, 0)).toBe(true);
    expect(nodeState(0, stars, 0)).toBe('cleared');
    expect(nodeState(1, stars, 0)).toBe('unlocked');
  });

  it('world 2 also needs three blooms', () => {
    const stars = new Array(TOTAL_STAGES).fill(0);
    for (let i = 0; i < 4; i++) stars[i] = 3;
    expect(isStageUnlocked(4, stars, 0)).toBe(false);
    expect(isStageUnlocked(4, stars, 3)).toBe(true);
  });

  it('a locked node always explains itself', () => {
    expect(lockReason(1, none, 0).length).toBeGreaterThan(0);
    expect(lockReason(0, none, 0)).toBe('');
  });

  it('points the PLAY button at the first open stage', () => {
    const stars = none.slice();
    stars[0] = 1;
    expect(nextPlayableStage(stars, 0)).toBe(1);
  });
});
