import { PLANTS } from '../src/constants/plants';
import { canPlant } from '../src/game/progression';
import { progressStore } from '../src/game/progressStore';

describe('candy garden', () => {
  beforeEach(() => progressStore.reset());

  it('refuses to plant without enough seeds', () => {
    expect(canPlant(0, 0, progressStore.getState().bloomed)).toBe(false);
    expect(progressStore.plant(0)).toBe(false);
  });

  it('spends seeds and blooms the plot', () => {
    progressStore.hydrate({ ...progressStore.serialize(), seeds: 10 });
    expect(progressStore.plant(0)).toBe(true);
    expect(progressStore.getState().bloomed[0]).toBe(true);
    expect(progressStore.getState().seeds).toBe(10 - PLANTS[0].cost);
  });

  it('never blooms the same plot twice', () => {
    progressStore.hydrate({ ...progressStore.serialize(), seeds: 20 });
    expect(progressStore.plant(1)).toBe(true);
    expect(progressStore.plant(1)).toBe(false);
  });
});
