/**
 * Virtual economy. Every currency source is gameplay derived.
 * There is no purchase, price, ad or billing path anywhere in this module.
 */
export const CURRENCIES = ['stars', 'seeds', 'tokens'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Virtual counters only - never money, never a price. */
export const REAL_MONEY_SOURCES: string[] = [];

export const CURRENCY_LABEL: Record<Currency, string> = {
  stars: 'STARS',
  seeds: 'SEEDS',
  tokens: 'SUGAR TOKENS',
};

export function isVirtualOnly(): boolean {
  return REAL_MONEY_SOURCES.length === 0;
}

/** Stars earned on a stage harvest straight into seeds. */
export function seedsForStars(stars: number): number {
  return Math.max(0, stars);
}

export function tokensForScore(score: number): number {
  return Math.floor(Math.max(0, score) / 25);
}

export function canAfford(balance: number, cost: number): boolean {
  return cost >= 0 && balance >= cost;
}

export function spend(balance: number, cost: number): number {
  if (!canAfford(balance, cost)) return balance;
  return balance - cost;
}

export function grant(balance: number, amount: number): number {
  return balance + Math.max(0, amount);
}

export const DISCLAIMER = 'VIRTUAL REWARDS ONLY · NO REAL MONEY';
