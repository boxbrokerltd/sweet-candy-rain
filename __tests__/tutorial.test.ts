import { progressStore } from '../src/game/progressStore';

describe('tutorial', () => {
  beforeEach(() => progressStore.reset());

  it('is unseen on a fresh install', () => {
    expect(progressStore.getState().tutorialSeen).toBe(false);
  });

  it('is marked seen once and stays seen', () => {
    progressStore.markTutorialSeen();
    expect(progressStore.getState().tutorialSeen).toBe(true);
    progressStore.markTutorialSeen();
    expect(progressStore.getState().tutorialSeen).toBe(true);
  });

  it('is wiped by a reset', () => {
    progressStore.markTutorialSeen();
    progressStore.reset();
    expect(progressStore.getState().tutorialSeen).toBe(false);
  });
});
