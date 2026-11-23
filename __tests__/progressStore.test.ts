import { TOTAL_STAGES } from '../src/constants/config';
import { defaultProgress, progressStore } from '../src/game/progressStore';

describe('progress store', () => {
  beforeEach(() => progressStore.reset());

  it('round-trips through serialize and hydrate', () => {
    progressStore.hydrate({ ...defaultProgress(), seeds: 7, tokens: 120 });
    const snapshot = progressStore.serialize();
    progressStore.reset();
    expect(progressStore.getState().seeds).toBe(0);
    progressStore.hydrate(snapshot);
    expect(progressStore.getState().seeds).toBe(7);
    expect(progressStore.getState().tokens).toBe(120);
  });

  it('notifies subscribers on every change', () => {
    let calls = 0;
    const off = progressStore.subscribe(() => {
      calls += 1;
    });
    progressStore.setSetting('hintPulse', false);
    off();
    progressStore.setSetting('hintPulse', true);
    expect(calls).toBe(1);
  });

  it('reset returns every counter to its default', () => {
    progressStore.hydrate({ ...defaultProgress(), seeds: 9, tutorialSeen: true });
    progressStore.reset();
    const s = progressStore.getState();
    expect(s.seeds).toBe(0);
    expect(s.tutorialSeen).toBe(false);
    expect(s.stageStars.length).toBe(TOTAL_STAGES);
    expect(s.stageStars.every(v => v === 0)).toBe(true);
  });

  it('survives a malformed snapshot', () => {
    progressStore.hydrate(null);
    expect(progressStore.getState().missions.length).toBe(3);
  });
});
