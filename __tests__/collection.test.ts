import { PLANTS } from '../src/constants/plants';
import { bloomCount, worldUnlockNote } from '../src/game/progression';
import { progressStore } from '../src/game/progressStore';

describe('collection screen data', () => {
  beforeEach(() => progressStore.reset());

  it('lists twelve named plants with a cost', () => {
    expect(PLANTS.length).toBe(12);
    PLANTS.forEach(p => {
      expect(p.name.length).toBeGreaterThan(3);
      expect(p.cost).toBeGreaterThan(0);
    });
  });

  it('counts blooms for the garden meter', () => {
    progressStore.hydrate({ ...progressStore.serialize(), seeds: 40 });
    progressStore.plant(0);
    progressStore.plant(1);
    expect(bloomCount(progressStore.getState().bloomed)).toBe(2);
  });

  it('explains the world unlocks', () => {
    expect(worldUnlockNote()).toContain('3 BLOOMS');
    expect(worldUnlockNote()).toContain('7');
  });
});
