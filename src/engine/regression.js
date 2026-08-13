import { ORDER } from "../data/tiers.js";
import { BADGES } from "../data/badges.js";
import { dayKey, addDaysKey, todayKey } from "./dateUtils.js";
import { onTargetDayCount } from "../lib/nutrition.js";

// Banked-consistency regression: every completed week performing at the level
// that earned a tier banks one week of cover; every week off spends one. When
// the bank runs out at the end of a week off, the badge drops one tier.
//
// So a tier earned with a single good week survives exactly one idle week,
// while a 6-week streak buys 6 weeks of slack. The floor is bronze: starting
// something is a fact about your past and is never taken away.
export const TIER_FLOOR = "bronze";

// Diet undoes progress faster than a missed workout, so the calorie badge's
// cover is tiered by track record instead of banking freely: a month of
// consistency forgives little, a year forgives a lot — but never everything.
function fuelBankCap(streakWeeks) {
  if (streakWeeks < 4) return 1; // building the habit: no room for a bad week
  if (streakWeeks < 13) return 2; // 1-3 months in
  if (streakWeeks < 26) return 3; // 3-6 months
  if (streakWeeks < 52) return 4; // 6-12 months
  return 6; // a year of proof
}

function bankCap(badgeId, streakWeeks) {
  return badgeId === "fuel" ? fuelBankCap(streakWeeks) : Infinity;
}

/** Monday (start) of the week containing the given date, as a dayKey. */
export function weekStartKey(d = new Date()) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const day = dt.getDay() || 7; // Mon=1..Sun=7
  dt.setDate(dt.getDate() - (day - 1));
  return dayKey(dt);
}

/** Monday of the most recently COMPLETED week. */
export function lastCompletedWeekKey(now = new Date()) {
  return addDaysKey(weekStartKey(now), -7);
}

/**
 * What one week must produce to hold a tier. Weekly badges use their ladder
 * value directly; monthly badges are pro-rated to a quarter of it; day-streak
 * ladders (Hydro) are capped at 7 qualifying days.
 */
export function weeklyNeed(badge, tier) {
  const idx = ORDER.indexOf(tier);
  if (idx <= 0) return null;
  const target = badge.ladder[Math.min(badge.ladder.length - 1, idx - 1)];
  if (/MONTH/.test(badge.unit) || /STREAK/.test(badge.unit)) {
    const need = Math.ceil(target / 4);
    return badge.dailyTarget || badge.id === "fuel" || /STREAK/.test(badge.unit)
      ? Math.min(7, need)
      : need;
  }
  return target;
}

/** Did the week starting at `weekStart` (a Monday dayKey) hold this tier? */
export function weekQualifies(badge, state, weekStart, tier) {
  const need = weeklyNeed(badge, tier);
  if (need == null) return true;
  const weekEnd = addDaysKey(weekStart, 7);
  const entries = (state.logs?.[badge.metric] || []).filter(
    (e) => e.date >= weekStart && e.date < weekEnd,
  );
  if (!entries.length) return false;

  if (badge.id === "fuel") {
    // Judge the week's calorie days as of after that week ended, so finished
    // cut days inside it count.
    return onTargetDayCount(entries, state, weekEnd) >= need;
  }

  if (badge.dailyTarget || /STREAK/.test(badge.unit)) {
    const byDay = {};
    entries.forEach((e) => {
      byDay[e.date] = (byDay[e.date] || 0) + e.amount;
    });
    const target = badge.dailyTarget || 1;
    return Object.values(byDay).filter((v) => v >= target).length >= need;
  }

  return entries.reduce((a, e) => a + e.amount, 0) >= need;
}

/** Is the current (in-progress) week already at holding level? */
export function isHolding(badge, state, tier) {
  return weekQualifies(badge, state, weekStartKey(), tier);
}

/** The weekly output required to hold the tier currently held. */
export function holdRequirement(badge, tier) {
  return weeklyNeed(badge, tier);
}

function bankFor(state, badgeId) {
  const b = state.badgeBank?.[badgeId];
  if (b && typeof b.bank === "number" && b.uptoWeek) {
    const streak = b.streak || 0;
    return { ...b, streak, bank: Math.min(bankCap(badgeId, streak), b.bank) };
  }
  // First time under this system (or a fresh promotion): one banked week,
  // clock starts now — nobody is punished for history the app never watched.
  return { bank: 1, streak: 0, uptoWeek: lastCompletedWeekKey() };
}

/**
 * Process every completed week since each badge was last assessed: qualifying
 * weeks grow the bank, idle weeks spend it, and an exhausted bank drops the
 * tier by one. Returns the patch to merge into state plus what was lost.
 */
export function applyRegression(state) {
  const badgeBank = { ...(state.badgeBank || {}) };
  const badgeTiers = { ...(state.badgeTiers || {}) };
  const demotions = [];
  const lastDone = lastCompletedWeekKey();

  for (const badge of BADGES) {
    let tier = badgeTiers[badge.id] || "locked";
    if (tier === "locked") continue;

    const b = bankFor(state, badge.id);
    let guard = 0;
    while (b.uptoWeek < lastDone && guard++ < 104) {
      const week = addDaysKey(b.uptoWeek, 7);
      if (tier === TIER_FLOOR) {
        // Nothing left to lose — just move the clock forward.
        b.uptoWeek = week;
        continue;
      }
      if (weekQualifies(badge, state, week, tier)) {
        b.streak = (b.streak || 0) + 1;
        b.bank = Math.min(bankCap(badge.id, b.streak), b.bank + 1);
      } else {
        b.streak = 0;
        b.bank -= 1;
        if (b.bank <= 0) {
          const idx = ORDER.indexOf(tier);
          const floorIdx = ORDER.indexOf(TIER_FLOOR);
          const nextTier = ORDER[Math.max(floorIdx, idx - 1)];
          if (nextTier !== tier) {
            demotions.push({ badgeId: badge.id, fromTier: tier, toTier: nextTier });
            tier = nextTier;
            badgeTiers[badge.id] = nextTier;
          }
          // Each further idle week costs one more tier, down to the floor.
          b.bank = 1;
        }
      }
      b.uptoWeek = week;
    }
    badgeBank[badge.id] = b;
  }

  return { badgeBank, badgeTiers, demotions };
}

/**
 * Status of one badge under the bank system. `bank` is weeks of cover;
 * `daysLeft` is how long until the tier would actually drop if the player
 * logs nothing at all from here on.
 */
export function badgeRisk(badge, state) {
  const tier = state.badgeTiers?.[badge.id] || "locked";
  if (tier === "locked" || tier === TIER_FLOOR) {
    return { status: "safe", tier, bank: null, daysLeft: null };
  }

  const bank = bankFor(state, badge.id).bank;
  if (isHolding(badge, state, tier)) {
    return { status: "holding", tier, bank, daysLeft: null };
  }

  // Days until the end of the current week, plus any spare banked weeks.
  const today = todayKey();
  const endOfWeek = addDaysKey(weekStartKey(), 7);
  const daysThisWeek = Math.max(
    1,
    Math.round((new Date(endOfWeek + "T00:00:00") - new Date(today + "T00:00:00")) / 86400000),
  );
  const daysLeft = daysThisWeek + Math.max(0, bank - 1) * 7;

  return {
    status: bank <= 1 ? "at_risk" : "slipping",
    tier,
    bank,
    daysLeft,
  };
}

/** Badges currently in their final banked week — used for the Player warning. */
export function badgesAtRisk(state) {
  return BADGES.map((b) => ({ badge: b, risk: badgeRisk(b, state) })).filter(
    (r) => r.risk.status === "at_risk",
  );
}
