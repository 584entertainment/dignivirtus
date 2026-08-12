// Schema versioning for the saved game blob. Plain .js (no JSX) so the node
// test runner can import it directly.
import { BADGES } from "../data/badges.js";

export const METRIC_LOG_KEYS = [
  "deltSets", "chestSets", "backSets", "armSets", "trapSets",
  "gluteSets", "hamstringSets", "quadSets", "calfSets", "forearmSets",
  "steps", "gpsKm", "zone2Minutes", "floors",
  "hipMobilityMinutes", "deepSquatHolds", "rotationMinutes", "foldHoldSeconds",
  "water", "sleepHours", "restDays", "restingHR",
  "sprints50m", "sprints20m", "calories",
];

export function emptyLogs() {
  return Object.fromEntries(METRIC_LOG_KEYS.map((k) => [k, []]));
}

// v1 → v2: old metrics fold into the nearest body-part metric. hangSeconds
// becomes forearm sets at roughly one set per 30 seconds of hold.
const METRIC_RENAMES = {
  lateralDeltSets: "deltSets",
  pressingSets: "chestSets",
  posteriorChainSets: "gluteSets",
  sprintsOver90: "sprints50m",
  accelerations: "sprints20m",
};
const BADGE_RENAMES = { delt: "delts", press: "chest", hinge: "glutes", grip: "forearms" };
const RETIRED_BADGES = ["idle", "split", "sub9"];

/**
 * Upgrade a saved v1 blob to schema v2. Runs on every INIT/HYDRATE and must be
 * a no-op on state that's already v2.
 */
export function migrateState(saved) {
  if (!saved || saved.schemaVersion >= 2) return saved;
  const next = { ...saved, schemaVersion: 2 };

  const oldLogs = saved.logs || {};
  const logs = {};
  for (const key of METRIC_LOG_KEYS) logs[key] = [...(oldLogs[key] || [])];
  for (const [oldKey, newKey] of Object.entries(METRIC_RENAMES)) {
    if (oldLogs[oldKey]?.length) logs[newKey] = [...logs[newKey], ...oldLogs[oldKey]];
  }
  if (oldLogs.hangSeconds?.length) {
    logs.forearmSets = [
      ...logs.forearmSets,
      ...oldLogs.hangSeconds.map((e) => ({ date: e.date, amount: Math.max(1, Math.round(e.amount / 30)) })),
    ];
  }
  next.logs = logs;

  const remapIds = (obj) => {
    const out = {};
    for (const [id, val] of Object.entries(obj || {})) {
      if (RETIRED_BADGES.includes(id)) continue;
      out[BADGE_RENAMES[id] || id] = val;
    }
    return out;
  };
  next.badgeTiers = remapIds(saved.badgeTiers);
  next.badgeHold = remapIds(saved.badgeHold);
  for (const b of BADGES) if (!next.badgeTiers[b.id]) next.badgeTiers[b.id] = "locked";
  next.lostQueue = (saved.lostQueue || []).filter((l) => !RETIRED_BADGES.includes(l.badgeId))
    .map((l) => ({ ...l, badgeId: BADGE_RENAMES[l.badgeId] || l.badgeId }));
  next.unlockQueue = [];
  if (RETIRED_BADGES.includes(next.activeBadgeId) || BADGE_RENAMES[next.activeBadgeId]) {
    next.activeBadgeId = BADGE_RENAMES[next.activeBadgeId] || "delts";
  }
  return next;
}
