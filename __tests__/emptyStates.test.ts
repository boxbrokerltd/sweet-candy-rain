import { TOTAL_STAGES } from '../src/constants/config';
import { lockReason } from '../src/game/progression';
import { progressStore, selectChestsReady, selectMissionsDone } from '../src/game/progressStore';

describe('empty and locked states', () => {
  beforeEach(() => progressStore.reset());

  it('a fresh garden has nothing to show', () => {
    const s = progressStore.getState();
    expect(s.seeds).toBe(0);
    expect(s.bloomed.every(b => !b)).toBe(true);
  });

  it('no chest is ready and no mission is done at the start', () => {
    expect(selectChestsReady(progressStore.getState())).toBe(0);
    expect(selectMissionsDone(progressStore.getState())).toBe(0);
  });

  it('a locked stage returns its requirement text instead of nothing', () => {
    const none = new Array(TOTAL_STAGES).fill(0);
    expect(lockReason(5, none, 0).length).toBeGreaterThan(0);
  });
});
