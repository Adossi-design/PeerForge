/**
 * Parse and clamp a pagination value coming from a query string.
 * Treats NaN / negative as the default, and caps to `max` to prevent abuse
 * (e.g. ?take=999999).
 */
export function clampInt(raw: string | undefined, defaultValue: number, max: number): number {
  const n = parseInt(raw ?? '', 10);
  if (!Number.isFinite(n) || n < 0) return defaultValue;
  return Math.min(n, max);
}

export const SKIP_DEFAULT = 0;
export const SKIP_MAX = 100_000;
export const TAKE_DEFAULT = 20;
export const TAKE_MAX = 100;
