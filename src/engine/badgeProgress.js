import { ORDER, TIERS, RARITY, GLOWS } from "../data/tiers.js";
import { weekKey, monthKey, dayKey, todayKey, daysAgo, addDaysKey } from "./dateUtils.js";

const PRIMARY_KINDS = ["ladder", "ladderCount", "ladderStreakDays", "best", "baselineDelta"];

function windowEntries(entries, window) {
  if (!entries?.length) return [];
  if (window === "week") {
    const wk = weekKey(new Date());
    return entries.filter((e) => weekKey(new Date(e.date + "T00:00:00")) === wk);
  }
  if (window === "month") {
    const mk = monthKey(new Date());
    return entries.filter((e) => e.date.slice(0, 7) === mk);
  }
  if (window === "today") {
    const tk = dayKey(new Date());
    return entries.filter((e) => e.date === tk);
  }
  if (window === "rolling7") {
    return entries.filter((e) => daysAgo(e.date) < 7);
  }
  return entries;
}

function sumWindow(entries, window) {
  return windowEntries(entries, window).reduce((a, e) => a + e.amount, 0);
}

function avgWindow(entries, window) {
  const w = windowEntries(entries, window);
  if (!w.length) return 0;
  return w.reduce((a, e) => a + e.amount, 0) / w.length;
}

function dailyTotals(entries) {
  const byDay = {};
  (entries || []).forEach((e) => {
    byDay[e.date] = (byDay[e.date] || 0) + e.amount;
  });
  return byDay;
}

function qualifyingDayCount(entries, window, dailyTarget) {
  const byDay = dailyTotals(windowEntries(entries, window));
  return Object.values(byDay).filter((v) => v >= dailyTarget).length;
}

function currentDayStreak(entries, dailyTarget) {
  const byDay = dailyTotals(entries);
  let streak = 0;
  let cursor = todayKey();
  while ((byDay[cursor] || 0) >= dailyTarget) {
    streak++;
    cursor = addDaysKey(cursor, -1);
  }
  return streak;
}

function weeklyTotals(entries) {
  const byWeek = {};
  (entries || []).forEach((e) => {
    const wk = weekKey(new Date(e.date + "T00:00:00"));
    byWeek[wk] = (byWeek[wk] || 0) + e.amount;
  });
  return byWeek;
}

function currentWeekStreak(entries, qualifyAt) {
  const byWeek = weeklyTotals(entries);
  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < 260; i++) {
    const wk = weekKey(cursor);
    if ((byWeek[wk] || 0) >= qualifyAt) {
      streak++;
      cursor = new Date(cursor.getTime() - 7 * 86400000);
    } else break;
  }
  return streak;
}

function bestInWindow(entries, window, invert) {
  const w = windowEntries(entries, window);
  if (!w.length) return null;
  const vals = w.map((e) => e.amount);
  return invert ? Math.min(...vals) : Math.max(...vals);
}

function primaryCurrentValue(req, badge, state) {
  const entries = state.logs[badge.metric] || [];
  if (req.kind === "ladder") return sumWindow(entries, req.window);
  if (req.kind === "ladderCount") return qualifyingDayCount(entries, req.window, req.dailyTarget);
  if (req.kind === "ladderStreakDays") return currentDayStreak(entries, req.dailyTarget);
  if (req.kind === "best") {
    const v = bestInWindow(entries, req.window, true);
    return v == null ? Infinity : v;
  }
  if (req.kind === "baselineDelta") {
    const baseline = state.baselines?.[badge.metric];
    const recentAvg = avgWindow(entries, "rolling7");
    if (baseline == null || !entries.length) return -Infinity;
    return Math.round(baseline - recentAvg);
  }
  return 0;
}

/** Highest ORDER index (0=locked..5=legend) this badge's live data currently qualifies for. */
export function eligibleTierIndex(badge, state) {
  const primaryReq = badge.reqs.find((r) => PRIMARY_KINDS.includes(r.kind));
  const cur = primaryCurrentValue(primaryReq, badge, state);
  let eligible = 0;
  for (let i = 0; i < 5; i++) {
    const target = badge.ladder[i];
    const pass = badge.invert ? cur <= target : cur >= target;
    if (pass) eligible = i + 1;
    else break;
  }
  return eligible;
}

function fmt(v) {
  if (typeof v !== "number" || !isFinite(v)) return "0";
  if (Math.abs(v) >= 1000) return v.toLocaleString();
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function evalRequirement(req, badge, state, ladderIdx, isPrimary) {
  if (isPrimary) {
    const cur = primaryCurrentValue(req, badge, state);
    const target = badge.ladder[Math.min(4, ladderIdx)];
    const done = badge.invert ? cur <= target : cur >= target;
    const pct = badge.invert
      ? isFinite(cur) && cur > 0
        ? Math.max(0, Math.min(100, (target / cur) * 100))
        : 0
      : Math.max(0, Math.min(100, (cur / target) * 100));
    return { cur: isFinite(cur) ? cur : 0, target, pct, done };
  }
  if (req.kind === "target") {
    const entries = state.logs[badge.metric] || [];
    const cur = req.agg === "avg" ? avgWindow(entries, req.window) : sumWindow(entries, req.window);
    const done = cur >= req.target;
    const pct = Math.max(0, Math.min(100, (cur / req.target) * 100));
    return { cur, target: req.target, pct, done };
  }
  if (req.kind === "streakWeeks") {
    const entries = state.logs[badge.metric] || [];
    const cur = currentWeekStreak(entries, req.qualifyAt);
    const done = cur >= req.target;
    const pct = Math.max(0, Math.min(100, (cur / req.target) * 100));
    return { cur, target: req.target, pct, done };
  }
  if (req.kind === "pr") {
    const done = !!state.flags?.[req.metricFlag];
    return { cur: done ? 1 : 0, target: 1, pct: done ? 100 : 0, done };
  }
  return { cur: 0, target: 1, pct: 0, done: false };
}

export function computeBadgeView(badge, state, index = 0) {
  const earnedTier = state.badgeTiers?.[badge.id] || "locked";
  const idx = ORDER.indexOf(earnedTier);
  const ladderIdx = Math.min(4, idx);
  const primaryReq = badge.reqs.find((r) => PRIMARY_KINDS.includes(r.kind));

  const reqViews = badge.reqs.map((r) => {
    const ev = evalRequirement(r, badge, state, ladderIdx, r === primaryReq);
    return {
      label: r.label,
      valText: `${fmt(ev.cur)} / ${fmt(ev.target)}${r.unit ? r.unit : ""}`,
      pct: ev.pct,
      done: ev.done,
    };
  });

  const pct = Math.round(reqViews.reduce((a, r) => a + r.pct, 0) / reqViews.length);
  const t = TIERS[earnedTier];
  const nextKey = ORDER[Math.min(5, idx + 1)];

  return {
    ...badge,
    reqs: reqViews,
    pct,
    tier: earnedTier,
    tierLabel: t.label,
    tierColor: t.color,
    foil: t.foil,
    glowShadow: GLOWS[earnedTier],
    opacity: earnedTier === "locked" ? 0.7 : 1,
    nextTierLabel: TIERS[nextKey].label,
    rarity: RARITY[nextKey] || "",
    hint: pct >= 100 && earnedTier !== "legend" ? "READY TO CLAIM" : `${pct}% TO ${TIERS[nextKey].label}`,
    ladder: ["bronze", "silver", "gold", "hof", "legend"].map((tk, i) => {
      const active = idx >= i + 1;
      return {
        tier: tk,
        name: TIERS[tk].label === "HALL OF FAME" ? "HOF" : TIERS[tk].label,
        need: badge.ladder[i],
        active,
      };
    }),
    foilDelay: `${(index % 5) * 0.9}s`,
  };
}

export { ORDER };
