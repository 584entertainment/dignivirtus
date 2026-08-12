import { ORDER } from "../data/tiers.js";
import { BADGES } from "../data/badges.js";
import { todayKey, daysAgo } from "./dateUtils.js";
import { onTargetDayCount } from "../lib/nutrition.js";

// Tiers reflect *current* ability, so holding one means still performing at the
// level that earned it. Fall below for long enough and the badge drops a tier.
//
// The floor is bronze: starting something is a fact about your past and is never
// taken away, but Silver and above have to be re-earned.
export const TIER_FLOOR = "bronze";

/** Maintenance window in days — matches how the badge measures itself. */
export function maintenanceWindow(badge) {
  return /MONTH/.test(badge.unit) ? 30 : 7;
}

/** Full grace period before a tier actually drops, and when we start warning. */
export function graceDays(badge) {
  return maintenanceWindow(badge) === 30 ? 45 : 21;
}
export function warnDays(badge) {
  return graceDays(badge) - 7;
}

function trailingEntries(entries, days) {
  return (entries || []).filter((e) => daysAgo(e.date) < days);
}

/**
 * What this badge is currently producing over its maintenance window, using the
 * same shape of measurement the badge is scored on.
 */
export function trailingValue(badge, state) {
  const entries = state.logs?.[badge.metric] || [];
  const window = maintenanceWindow(badge);
  const recent = trailingEntries(entries, window);

  if (badge.id === "fuel") {
    // Macro Governor counts on-target calorie days, not raw kcal totals.
    return onTargetDayCount(recent, state, todayKey());
  }

  if (badge.invert) {
    if (!recent.length) return Infinity;
    return Math.min(...recent.map((e) => e.amount));
  }

  if (badge.dailyTarget) {
    // Streak/qualifying-day badges count days that cleared the daily bar.
    const byDay = {};
    recent.forEach((e) => {
      byDay[e.date] = (byDay[e.date] || 0) + e.amount;
    });
    return Object.values(byDay).filter((v) => v >= badge.dailyTarget).length;
  }

  return recent.reduce((a, e) => a + e.amount, 0);
}

/** The output required to hold the tier currently held. */
export function holdRequirement(badge, tier) {
  const idx = ORDER.indexOf(tier);
  if (idx <= 0) return null;
  return badge.ladder[Math.min(badge.ladder.length - 1, idx - 1)];
}

export function isHolding(badge, state, tier) {
  const need = holdRequirement(badge, tier);
  if (need == null) return true;
  const have = trailingValue(badge, state);
  return badge.invert ? have <= need : have >= need;
}

/**
 * Status of one badge: holding, warned, or overdue for a drop.
 * `heldAt` is the last date the badge was seen meeting its hold requirement.
 */
export function badgeRisk(badge, state) {
  const tier = state.badgeTiers?.[badge.id] || "locked";
  if (tier === "locked" || tier === TIER_FLOOR) {
    return { status: "safe", tier, daysIdle: 0, daysLeft: null };
  }

  const holding = isHolding(badge, state, tier);
  if (holding) return { status: "holding", tier, daysIdle: 0, daysLeft: null };

  const heldAt = state.badgeHold?.[badge.id];
  const daysIdle = heldAt ? daysAgo(heldAt) : 0;
  const grace = graceDays(badge);
  const daysLeft = Math.max(0, grace - daysIdle);

  return {
    status: daysIdle >= grace ? "dropping" : daysIdle >= warnDays(badge) ? "at_risk" : "slipping",
    tier,
    daysIdle,
    daysLeft,
  };
}

/**
 * Refresh hold timestamps and apply any tier drops that are due.
 * Returns the patch to merge into state, plus what was lost (for the UI notice).
 */
export function applyRegression(state) {
  const today = todayKey();
  const badgeHold = { ...(state.badgeHold || {}) };
  const badgeTiers = { ...(state.badgeTiers || {}) };
  const demotions = [];

  for (const badge of BADGES) {
    const tier = badgeTiers[badge.id] || "locked";
    if (tier === "locked") continue;

    if (isHolding(badge, state, tier)) {
      // Still performing at the level that earned it — clock resets.
      badgeHold[badge.id] = today;
      continue;
    }

    // First time we've seen it slipping: start the clock now rather than
    // back-dating, so nobody is punished for history the app never watched.
    if (!badgeHold[badge.id]) {
      badgeHold[badge.id] = today;
      continue;
    }

    if (tier === TIER_FLOOR) continue;

    if (daysAgo(badgeHold[badge.id]) >= graceDays(badge)) {
      const idx = ORDER.indexOf(tier);
      const floorIdx = ORDER.indexOf(TIER_FLOOR);
      const nextTier = ORDER[Math.max(floorIdx, idx - 1)];
      if (nextTier !== tier) {
        badgeTiers[badge.id] = nextTier;
        demotions.push({ badgeId: badge.id, fromTier: tier, toTier: nextTier });
        // Restart the clock so a single lapse costs one tier, not several.
        badgeHold[badge.id] = today;
      }
    }
  }

  return { badgeHold, badgeTiers, demotions };
}

/** Badges currently warned or overdue — used for the Player screen warning. */
export function badgesAtRisk(state) {
  return BADGES.map((b) => ({ badge: b, risk: badgeRisk(b, state) })).filter(
    (r) => r.risk.status === "at_risk" || r.risk.status === "dropping",
  );
}
