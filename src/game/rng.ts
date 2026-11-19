/** Deterministic, reproducible per-attempt randomness (rule 6.2). */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** seed = stageIndex * 7919 ^ attempt * 104729 - logged with every run. */
export function seedFor(stageIndex: number, attempt: number): number {
  return ((stageIndex + 1) * 7919) ^ ((attempt + 1) * 104729);
}

export function randInt(rng: Rng, maxExclusive: number): number {
  const max = Math.max(1, maxExclusive);
  return Math.min(max - 1, Math.floor(rng() * max));
}

export function shuffle<T>(rng: Rng, input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}
