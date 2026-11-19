import { CHESTS, TOTAL_STAGES } from '../src/constants/config';
import { progressStore } from '../src/game/progressStore';

describe('reward chests', () => {
  beforeEach(() => progressStore.reset());

  it('cannot be claimed without the stars', () => {
    expect(progressStore.claimChest(0)).toBe(false);
  });

  it('pays seeds and tokens once', () => {
    const stars = new Array(TOTAL_STAGES).fill(0);
    stars[0] = 3;
    progressStore.hydrate({ ...progressStore.serialize(), stageStars: stars });
    expect(progressStore.claimChest(0)).toBe(true);
    expect(progressStore.getState().seeds).toBe(CHESTS[0].seeds);
    expect(progressStore.getState().tokens).toBe(CHESTS[0].tokens);
    expect(progressStore.claimChest(0)).toBe(false);
  });

  it('the 15 star chest grants a rain head start', () => {
    const stars = new Array(TOTAL_STAGES).fill(0);
    for (let i = 0; i < 6; i++) stars[i] = 3;
    progressStore.hydrate({ ...progressStore.serialize(), stageStars: stars });
    expect(progressStore.claimChest(2)).toBe(true);
    expect(progressStore.getState().headStart).toBe(true);
    expect(progressStore.consumeHeadStart()).toBe(true);
    expect(progressStore.consumeHeadStart()).toBe(false);
  });
});
