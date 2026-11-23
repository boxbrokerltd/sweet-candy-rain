/** Thousands separator without pulling Intl into the render path. */
export function formatScore(value: number): string {
  const n = Math.max(0, Math.floor(value));
  const s = String(n);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const fromEnd = s.length - i;
    out += s[i];
    if (fromEnd > 1 && fromEnd % 3 === 1) out += ',';
  }
  return out;
}

export function formatStars(value: number): string {
  return '★ ' + Math.max(0, Math.floor(value));
}

export function pad2(value: number): string {
  return value < 10 ? '0' + value : String(value);
}

export function ratio(cur: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, cur / max));
}
