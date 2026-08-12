// Quick behavioural checks on tier regression, schema migration, run tracking,
// nutrition maths and unit conversion. Run: node scripts/regression.test.mjs
import { applyRegression, badgeRisk, isHolding, graceDays } from "../src/engine/regression.js";
import { BADGE_MAP } from "../src/data/badges.js";
import { migrateState } from "../src/engine/migrate.js";
import { createRunTracker } from "../src/lib/runTracker.js";
import { restingMetabolicRate, isOnTarget, onTargetDayCount } from "../src/lib/nutrition.js";
import { formatDistance, formatWeight, formatVolume } from "../src/lib/units.js";

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

// delts = weekly sets badge, ladder [6,12,20,32,50]; silver needs 12/wk to hold.
const delts = BADGE_MAP.delts;

// --- still training at the level that earned it -> holding, no drop -----------
{
  const s = baseState({
    logs: { deltSets: [{ date: dayKey(1), amount: 8 }, { date: dayKey(3), amount: 6 }] },
    badgeTiers: { delts: "silver" },
    badgeHold: { delts: dayKey(40) },
  });
  check("holds silver while hitting 14 sets/wk", isHolding(delts, s, "silver"), true);
  const r = applyRegression(s);
  check("no demotion while holding", r.demotions.length, 0);
  check("hold clock reset to today", r.badgeHold.delts, dayKey(0));
}

// --- lapsed well past the grace window -> drops exactly one tier --------------
{
  const s = baseState({
    logs: { deltSets: [{ date: dayKey(60), amount: 30 }] },
    badgeTiers: { delts: "gold" },
    badgeHold: { delts: dayKey(graceDays(delts) + 5) },
  });
  const r = applyRegression(s);
  check("gold drops after grace", r.badgeTiers.delts, "silver");
  check("one demotion recorded", r.demotions.length, 1);
  check("clock restarts so one lapse costs one tier", r.badgeHold.delts, dayKey(0));
}

// --- bronze is the floor ------------------------------------------------------
{
  const s = baseState({
    logs: { deltSets: [] },
    badgeTiers: { delts: "bronze" },
    badgeHold: { delts: dayKey(99) },
  });
  const r = applyRegression(s);
  check("bronze never drops", r.badgeTiers.delts, "bronze");
  check("no demotion at floor", r.demotions.length, 0);
}

// --- newly slipping starts the clock rather than back-dating a punishment -----
{
  const s = baseState({
    logs: { deltSets: [] },
    badgeTiers: { delts: "gold" },
    badgeHold: {},
  });
  const r = applyRegression(s);
  check("first slip only starts the clock", r.demotions.length, 0);
  check("clock starts today", r.badgeHold.delts, dayKey(0));
}

// --- warning fires before the drop -------------------------------------------
{
  const s = baseState({
    logs: { deltSets: [] },
    badgeTiers: { delts: "gold" },
    badgeHold: { delts: dayKey(graceDays(delts) - 3) },
  });
  const risk = badgeRisk(delts, s);
  check("warns before dropping", risk.status, "at_risk");
  check("counts down the days left", risk.daysLeft, 3);
}

// === schema v1 -> v2 migration ================================================
{
  const v1 = {
    onboarded: true,
    activeBadgeId: "delt",
    logs: {
      lateralDeltSets: [{ date: dayKey(1), amount: 5 }],
      pressingSets: [{ date: dayKey(2), amount: 4 }],
      posteriorChainSets: [{ date: dayKey(1), amount: 6 }],
      hangSeconds: [{ date: dayKey(1), amount: 90 }],
      sprintsOver90: [{ date: dayKey(3), amount: 2 }],
      best1kmSplit: [{ date: dayKey(2), amount: 4.5 }],
      steps: [{ date: dayKey(0), amount: 8000 }],
    },
    badgeTiers: { delt: "silver", press: "bronze", hinge: "gold", grip: "bronze", idle: "silver", sub9: "gold", tenk: "silver" },
    badgeHold: { delt: dayKey(3), idle: dayKey(5) },
    lostQueue: [{ badgeId: "sub9", fromTier: "gold", toTier: "silver" }, { badgeId: "delt", fromTier: "gold", toTier: "silver" }],
  };
  const m = migrateState(v1);
  check("migration stamps v2", m.schemaVersion, 2);
  check("delt sets fold into deltSets", m.logs.deltSets, [{ date: dayKey(1), amount: 5 }]);
  check("pressing folds into chestSets", m.logs.chestSets, [{ date: dayKey(2), amount: 4 }]);
  check("posterior folds into gluteSets", m.logs.gluteSets, [{ date: dayKey(1), amount: 6 }]);
  check("90s hang becomes 3 forearm sets", m.logs.forearmSets, [{ date: dayKey(1), amount: 3 }]);
  check("sprints carry over to 50m metric", m.logs.sprints50m, [{ date: dayKey(3), amount: 2 }]);
  check("best1kmSplit is dropped", m.logs.best1kmSplit, undefined);
  check("tiers carry: delt->delts silver", m.badgeTiers.delts, "silver");
  check("tiers carry: hinge->glutes gold", m.badgeTiers.glutes, "gold");
  check("retired idle tier removed", m.badgeTiers.idle, undefined);
  check("new badge ids start locked", m.badgeTiers.quads, "locked");
  check("badgeHold ids remapped", m.badgeHold.delts, dayKey(3));
  check("lostQueue drops retired ids", m.lostQueue.length, 1);
  check("activeBadgeId remapped", m.activeBadgeId, "delts");
  const again = migrateState(m);
  check("migration is a no-op on v2 state", again, m);
}

// === run tracker / sprint detection ===========================================
// Build a fix stream heading due north; 1e-5 deg lat ~ 1.11 m.
const fixesFromSpeeds = (speeds) => {
  // speeds: m/s per 1-second tick
  let lat = 50;
  let t = 1700000000000;
  const out = [{ lat, lng: 0, timestamp: t, accuracy: 5 }];
  for (const v of speeds) {
    lat += v / 111320; // metres -> degrees
    t += 1000;
    out.push({ lat, lng: 0, timestamp: t, accuracy: 5 });
  }
  return out;
};

{
  // Steady 3 m/s jog for 60s -> distance, no sprints.
  const tr = createRunTracker();
  fixesFromSpeeds(Array(60).fill(3)).forEach((f) => tr.addFix(f));
  const r = tr.stop();
  check("jog logs ~0.18 km", Math.abs(r.totalKm - 0.18) < 0.01, true);
  check("jog detects no sprints", r.sprints50 + r.sprints20, 0);
}

{
  // Jog, then a 10s burst at 7 m/s (~70m), then jog -> one 50m sprint.
  const tr = createRunTracker();
  fixesFromSpeeds([...Array(10).fill(3), ...Array(10).fill(7), ...Array(10).fill(2)]).forEach((f) => tr.addFix(f));
  const r = tr.stop();
  check("70m burst counts one 50m sprint", r.sprints50, 1);
  check("70m burst is not double-counted as 20m", r.sprints20, 0);
}

{
  // A 4s burst at 7 m/s (~28m) -> one 20m start.
  const tr = createRunTracker();
  fixesFromSpeeds([...Array(10).fill(3), ...Array(4).fill(7), ...Array(10).fill(2)]).forEach((f) => tr.addFix(f));
  const r = tr.stop();
  check("28m burst counts one 20m start", r.sprints20, 1);
  check("28m burst is not a 50m sprint", r.sprints50, 0);
}

{
  // Garbage fixes (accuracy 40m) are ignored entirely.
  const tr = createRunTracker();
  fixesFromSpeeds(Array(10).fill(3)).forEach((f) => tr.addFix({ ...f, accuracy: 40 }));
  const r = tr.stop();
  check("low-accuracy fixes ignored", r.totalKm, 0);
}

// === nutrition ================================================================
{
  check("RMR male 80kg/180cm/30", restingMetabolicRate({ weightKg: 80, heightCm: 180, age: 30, sex: "male" }), 1780);
  check("RMR female 65kg/165cm/28", restingMetabolicRate({ weightKg: 65, heightCm: 165, age: 28, sex: "female" }), 1380);
  check("RMR null without height", restingMetabolicRate({ weightKg: 80, age: 30, sex: "male" }), null);

  const cutState = { rmr: 1800, calorieGoal: "cut" };
  const buildState = { rmr: 1800, calorieGoal: "build" };
  check("cut: 1700 is on target", isOnTarget(1700, cutState), true);
  check("cut: 1900 is off target", isOnTarget(1900, cutState), false);
  check("build: 1900 is on target", isOnTarget(1900, buildState), true);

  const entries = [
    { date: dayKey(2), amount: 900 }, { date: dayKey(2), amount: 700 }, // 1600, under
    { date: dayKey(1), amount: 2000 }, // over
    { date: dayKey(0), amount: 500 }, // today, partial
  ];
  check("cut counts only finished under-days", onTargetDayCount(entries, cutState, dayKey(0)), 1);
  check("build counts crossed days incl. today? no - only 2000 day", onTargetDayCount(entries, buildState, dayKey(0)), 1);
}

// === units ====================================================================
{
  check("10 km -> 6.2 mi", formatDistance(10, "imperial"), { value: "6.2", suffix: "mi" });
  check("80 kg -> 176 lb", formatWeight(80, "imperial"), { value: 176, suffix: "lb" });
  check("3.2 L -> 108 oz", formatVolume(3.2, "imperial"), { value: 108, suffix: "oz" });
  check("metric passthrough", formatDistance(10, "metric"), { value: "10.0", suffix: "km" });
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
