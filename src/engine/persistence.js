// localStorage is now only an offline cache in front of Supabase. It is keyed per
// user, so signing in as someone else on the same browser can never surface the
// previous account's data.

const BASE = "overall.save.v1";

/** The old single-user key from before accounts existed — migrated once, then removed. */
export const LEGACY_KEY = BASE;

export const userKey = (userId) => `${BASE}.${userId}`;

export function readState(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeState(key, state) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode) — the cloud copy is the real one,
    // so losing the cache is survivable.
  }
}

export function removeState(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** UI-only fields that should never be persisted or synced between devices. */
const TRANSIENT = new Set(["screen", "filter", "activeBadgeId", "unlockQueue"]);

export function stripTransient(state) {
  const out = {};
  for (const [k, v] of Object.entries(state)) {
    if (!TRANSIENT.has(k)) out[k] = v;
  }
  return out;
}
