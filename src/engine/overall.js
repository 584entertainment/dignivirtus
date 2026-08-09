import { ATTRIBUTES, bandForScore } from "../data/attributes.js";
import { daysAgo, todayKey, weekKey } from "./dateUtils.js";

// Speed decays fastest per the design spec; the rest are gentler slopes — not spec'd
// exactly, so these are a reasonable approximation of "higher-rated players decay faster".
const DECAY_DAYS = { STR: 10, END: 8, MOB: 10, REC: 8, SPD: 5 };
const BUMP_PER_LOG = 0.6;
const DAILY_BUMP_CAP = 1.5;

export function attrValue(key, state) {
  const base = state.attributeBase?.[key] ?? 40;
  const bump = state.attributeBumps?.[key] ?? 0;
  let decay = 0;
  // Decay models behavior *lapsing* — an attribute that's never had a logged
  // activity yet (fresh off the baseline survey) hasn't lapsed, so it doesn't decay.
  const last = state.lastActivity?.[key];
  if (state.decayWarnings !== false && last) {
    const days = daysAgo(last);
    const rate = DECAY_DAYS[key] || 10;
    if (days > rate) decay = Math.min(20, Math.floor((days - rate) / rate) + 1);
  }
  return Math.max(0, Math.min(100, Math.round(base + bump - decay)));
}

export function computeAttributes(state) {
  return ATTRIBUTES.map((a) => {
    const val = attrValue(a.key, state);
    const snap = state.attributeWeekSnapshot?.[a.key];
    const delta = snap == null ? 0 : val - snap;
    return { ...a, val, delta };
  });
}

export function computeOverall(state) {
  const attrs = computeAttributes(state);
  const overall = Math.round(attrs.reduce((a, b) => a + b.val, 0) / 5);
  return { overall, attrs, band: bandForScore(overall) };
}

function rawAttrValue(key, state) {
  const base = state.attributeBase?.[key] ?? 40;
  const bump = state.attributeBumps?.[key] ?? 0;
  let decay = 0;
  // Decay models behavior *lapsing* — an attribute that's never had a logged
  // activity yet (fresh off the baseline survey) hasn't lapsed, so it doesn't decay.
  const last = state.lastActivity?.[key];
  if (state.decayWarnings !== false && last) {
    const days = daysAgo(last);
    const rate = DECAY_DAYS[key] || 10;
    if (days > rate) decay = Math.min(20, Math.floor((days - rate) / rate) + 1);
  }
  return Math.max(0, Math.min(100, base + bump - decay));
}

/** Unrounded overall — used only to show fractional progress toward the next whole point. */
export function computeOverallRaw(state) {
  const raw = ATTRIBUTES.reduce((a, at) => a + rawAttrValue(at.key, state), 0) / 5;
  return raw;
}

export function baselineOverall(state) {
  const base = state.attributeBase || {};
  const vals = ATTRIBUTES.map((a) => base[a.key] ?? 40);
  return Math.round(vals.reduce((a, b) => a + b, 0) / 5);
}

/** Adds a small, capped nudge to an attribute and marks it "active today" (resets decay). */
export function applyAttributeBump(state, attrKey) {
  const today = todayKey();
  const dayField = `${attrKey}:${today}`;
  const dayBumps = { ...(state.dayBumps || {}) };
  const usedToday = dayBumps[dayField] || 0;
  const add = Math.max(0, Math.min(BUMP_PER_LOG, DAILY_BUMP_CAP - usedToday));
  dayBumps[dayField] = usedToday + add;
  const attributeBumps = { ...(state.attributeBumps || {}), [attrKey]: (state.attributeBumps?.[attrKey] || 0) + add };
  const lastActivity = { ...(state.lastActivity || {}), [attrKey]: today };
  return { attributeBumps, dayBumps, lastActivity };
}

/** Rolls the weekly delta snapshot forward if we've entered a new week since last load. */
export function maybeRollWeekSnapshot(state) {
  const wk = weekKey(new Date());
  if (state.snapshotWeekKey === wk) return {};
  const attrs = computeAttributes(state);
  const snapshot = Object.fromEntries(attrs.map((a) => [a.key, a.val]));
  return { attributeWeekSnapshot: snapshot, snapshotWeekKey: wk };
}

// "Point cost scales up" per the spec — displayed as qualifying sessions needed for the
// next point, growing with current rating (spec examples: 9 sessions at 61, 34 at 85).
export function sessionsToNextPoint(overall) {
  return Math.max(1, Math.round(2 + Math.pow(Math.max(0, overall - 30) / 10, 2)));
}
