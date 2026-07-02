/**
 * Generates a unique id for pages and blocks.
 * Falls back to a timestamp + random suffix when `crypto.randomUUID` is unavailable
 * (e.g. non-secure contexts).
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
