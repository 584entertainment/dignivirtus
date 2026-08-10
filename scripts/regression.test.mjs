// Quick behavioural checks on tier regression. Run: node scripts/regression.test.mjs
import { applyRegression, badgeRisk, isHolding, graceDays } from "../src/engine/regression.js";
import { BADGE_MAP } from "../src/data/badges.js";

const dayKey = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

let pass = 0;
let fail = 0;
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  else {
    fail++;
    console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`);
    return;
  }
  console.log(`ok   ${name}`);
};

const baseState = (over = {}) => ({
  logs: {},
  badgeTiers: {},
  badgeHold: {},
  ...over,
});

// delt = weekly sets badge, ladder [6,12,20,32,50]; silver needs 12/wk to hold.
const delt = BADGE_MAP.delt;

// --- still training at the level that earned it -> holding, no drop -----------
{
  const s = baseState({
    logs: { lateralDeltSets: [{ date: dayKey(1), amount: 8 }, { date: dayKey(3), amount: 6 }] },
    badgeTiers: { delt: "silver" },
    badgeHold: { delt: dayKey(40) },
  });
  check("holds silver while hitting 14 sets/wk", isHolding(delt, s, "silver"), true);
  const r = applyRegression(s);
  check("no demotion while holding", r.demotions.length, 0);
  check("hold clock reset to today", r.badgeHold.delt, dayKey(0));
}

// --- lapsed well past the grace window -> drops exactly one tier --------------
{
  const s = baseState({
    logs: { lateralDeltSets: [{ date: dayKey(60), amount: 30 }] },
    badgeTiers: { delt: "gold" },
    badgeHold: { delt: dayKey(graceDays(delt) + 5) },
  });
  const r = applyRegression(s);
  check("gold drops after grace", r.badgeTiers.delt, "silver");
  check("one demotion recorded", r.demotions.length, 1);
  check("clock restarts so one lapse costs one tier", r.badgeHold.delt, dayKey(0));
}

// --- bronze is the floor ------------------------------------------------------
{
  const s = baseState({
    logs: { lateralDeltSets: [] },
    badgeTiers: { delt: "bronze" },
    badgeHold: { delt: dayKey(99) },
  });
  const r = applyRegression(s);
  check("bronze never drops", r.badgeTiers.delt, "bronze");
  check("no demotion at floor", r.demotions.length, 0);
}

// --- newly slipping starts the clock rather than back-dating a punishment -----
{
  const s = baseState({
    logs: { lateralDeltSets: [] },
    badgeTiers: { delt: "gold" },
    badgeHold: {},
  });
  const r = applyRegression(s);
  check("first slip only starts the clock", r.demotions.length, 0);
  check("clock starts today", r.badgeHold.delt, dayKey(0));
}

// --- warning fires before the drop -------------------------------------------
{
  const s = baseState({
    logs: { lateralDeltSets: [] },
    badgeTiers: { delt: "gold" },
    badgeHold: { delt: dayKey(graceDays(delt) - 3) },
  });
  const risk = badgeRisk(delt, s);
  check("warns before dropping", risk.status, "at_risk");
  check("counts down the days left", risk.daysLeft, 3);
}

// --- inverted badge (lower is better) ----------------------------------------
{
  const sub9 = BADGE_MAP.sub9; // ladder [5.3,4.7,4.15,3.5,3.05], lower is better
  const fast = baseState({
    logs: { best1kmSplit: [{ date: dayKey(2), amount: 4.5 }] },
    badgeTiers: { sub9: "silver" },
  });
  check("inverted: a 4.5 split holds silver (needs <=4.7)", isHolding(sub9, fast, "silver"), true);

  const slow = baseState({
    logs: { best1kmSplit: [{ date: dayKey(2), amount: 5.9 }] },
    badgeTiers: { sub9: "silver" },
  });
  check("inverted: a 5.9 split does not hold silver", isHolding(sub9, slow, "silver"), false);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
