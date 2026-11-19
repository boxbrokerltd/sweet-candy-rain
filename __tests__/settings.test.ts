import { TIMING } from '../src/constants/config';
import { CANDY_MARKS } from '../src/constants/theme';
import { DEFAULT_SETTINGS, progressStore } from '../src/game/progressStore';

describe('settings', () => {
  beforeEach(() => progressStore.reset());

  it('ships the documented defaults', () => {
    expect(DEFAULT_SETTINGS.candyMarks).toBe(true);
    expect(DEFAULT_SETTINGS.gentleMotion).toBe(false);
    expect(DEFAULT_SETTINGS.hintPulse).toBe(true);
  });

  it('applies a toggle immediately and keeps it', () => {
    progressStore.setSetting('gentleMotion', true);
    expect(progressStore.getState().settings.gentleMotion).toBe(true);
    expect(progressStore.serialize().settings.gentleMotion).toBe(true);
  });

  it('gentle motion shortens the fall and the screen change', () => {
    expect(TIMING.fallGentle).toBeLessThan(TIMING.fall);
    expect(TIMING.screenFadeGentle).toBeLessThan(TIMING.screenFade);
  });

  it('candy marks are five unique renderable glyphs', () => {
    expect(CANDY_MARKS.length).toBe(5);
    expect(new Set(CANDY_MARKS).size).toBe(5);
    CANDY_MARKS.forEach(m => expect('\u2192\u2190\u25B6\u203A'.indexOf(m)).toBe(-1));
  });
});
