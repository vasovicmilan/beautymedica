const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function resolveLimit(value) {
  const n = parseInt(value, 10);
  if (!n || n < 1) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

export function resolveSkip(page, limit) {
  const p = parseInt(page, 10);
  if (!p || p < 1) return 0;
  return (p - 1) * limit;
}