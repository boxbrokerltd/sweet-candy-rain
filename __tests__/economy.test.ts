import { DISCLAIMER, canAfford, grant, isVirtualOnly, seedsForStars, spend, tokensForScore } from '../src/game/economy';

describe('virtual economy', () => {
  it('has no real-money source at all', () => {
    expect(isVirtualOnly()).toBe(true);
    expect(DISCLAIMER).toContain('NO REAL MONEY');
  });

  it('derives seeds from stars and tokens from score', () => {
    expect(seedsForStars(3)).toBe(3);
    expect(seedsForStars(0)).toBe(0);
    expect(tokensForScore(250)).toBe(10);
  });

  it('never spends more than the balance holds', () => {
    expect(canAfford(2, 5)).toBe(false);
    expect(spend(2, 5)).toBe(2);
    expect(spend(5, 5)).toBe(0);
    expect(grant(5, 4)).toBe(9);
  });
});
