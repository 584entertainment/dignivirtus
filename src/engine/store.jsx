import { createContext, useContext, useReducer } from "react";
import { BADGES } from "../data/badges.js";
import { baselineFromAnswers } from "../data/survey.js";
import { eligibleTierIndex, ORDER } from "./badgeProgress.js";
import { applyAttributeBump, maybeRollWeekSnapshot, computeAttributes } from "./overall.js";
import { applyRegression, lastCompletedWeekKey } from "./regression.js";
import { todayKey, daysAgo } from "./dateUtils.js";
import { emptyLogs, migrateState } from "./migrate.js";

export { migrateState };
import { restingMetabolicRate } from "../lib/nutrition.js";

function defaultState() {
  return {
    schemaVersion: 2,
    onboarded: false,
    name: "Jordan Diaz",
    avatarInitials: "JD",
    age: null,
    weight: 78,
    units: "metric",
    heightCm: null,
    sex: null,
    exactAge: null,
    calorieGoal: null,
    rmr: null,
    dailyTargets: { steps: 10000, water: 3.2, sets: 10, calories: null },
    surveyAnswers: {},
    attributeBase: { STR: 40, END: 40, MOB: 40, REC: 40, SPD: 40 },
    attributeBumps: {},
    dayBumps: {},
    lastActivity: {},
    attributeWeekSnapshot: null,
    snapshotWeekKey: null,
    decayWarnings: true,
    logs: emptyLogs(),
    flags: { hingePR: false },
    baselines: {},
    badgeTiers: Object.fromEntries(BADGES.map((b) => [b.id, "locked"])),
    seasonPeak: 0,
    streak: 0,
    lastOpenDate: null,
    screen: "player",
    filter: "ALL",
    activeBadgeId: "delts",
    activePart: null,
    unlockQueue: [],
    onboardedAt: null,
    lastUnlock: null,
    // Weeks of cover per badge: consecutive held weeks bank up, idle weeks
    // spend down; an empty bank at week's end drops the tier.
    badgeBank: {},
    // Tier drops since the player last acknowledged them.
    lostQueue: [],
  };
}

/** Recompute promotions, then demotions, in that order. */
function settleBadges(state) {
  const { badgeTiers, unlocks } = recomputeBadgeTiers(state);
  let next = {
    ...state,
    badgeTiers,
    unlockQueue: [...state.unlockQueue, ...unlocks],
    lastUnlock: unlocks.length ? unlocks[unlocks.length - 1] : state.lastUnlock,
  };

  // A freshly promoted tier starts with one banked week — this week's work.
  const badgeBank = { ...(state.badgeBank || {}) };
  for (const u of unlocks) {
    badgeBank[u.badgeId] = { bank: 1, uptoWeek: lastCompletedWeekKey() };
  }
  next = { ...next, badgeBank };

  const reg = applyRegression(next);
  next = {
    ...next,
    badgeBank: reg.badgeBank,
    badgeTiers: reg.badgeTiers,
    lostQueue: [...(next.lostQueue || []), ...reg.demotions],
  };

  return withSeasonPeak(next);
}

function recomputeBadgeTiers(state) {
  const badgeTiers = { ...state.badgeTiers };
  const unlocks = [];
  for (const b of BADGES) {
    const currentIdx = ORDER.indexOf(badgeTiers[b.id] || "locked");
    const eligibleIdx = eligibleTierIndex(b, state);
    if (eligibleIdx > currentIdx) {
      badgeTiers[b.id] = ORDER[eligibleIdx];
      unlocks.push({ badgeId: b.id, fromTier: ORDER[currentIdx], toTier: ORDER[eligibleIdx] });
    }
  }
  return { badgeTiers, unlocks };
}

function withSeasonPeak(state) {
  const { overall } = computeAttributesAndOverall(state);
  return { ...state, seasonPeak: Math.max(state.seasonPeak || 0, overall) };
}

function computeAttributesAndOverall(state) {
  const attrs = computeAttributes(state);
  const overall = Math.round(attrs.reduce((a, b) => a + b.val, 0) / 5);
  return { attrs, overall };
}

function reducer(state, action) {
  switch (action.type) {
    case "INIT": {
      let next = { ...defaultState(), ...migrateState(action.saved) };
      next = { ...next, ...maybeRollWeekSnapshot(next) };
      const today = todayKey();
      if (next.lastOpenDate) {
        const gap = daysAgo(next.lastOpenDate);
        if (gap === 1) next.streak = (next.streak || 0) + 1;
        else if (gap > 1) next.streak = 1;
        else next.streak = next.streak || (next.onboarded ? 1 : 0);
      } else if (next.onboarded) {
        next.streak = 1;
      }
      next.lastOpenDate = today;
      // Opening the app is when lapses get reckoned with — a tier can be lost
      // between sessions, not only while actively logging.
      return next.onboarded ? settleBadges(next) : withSeasonPeak(next);
    }

    // Replace local state with whatever came back from the cloud (or the offline
    // cache). Transient UI fields are re-seeded from defaults so a synced payload
    // can never drop someone onto a stale screen.
    case "HYDRATE": {
      const base = defaultState();
      const migrated = migrateState(action.state) || {};
      const merged = {
        ...base,
        ...migrated,
        logs: { ...base.logs, ...(migrated.logs || {}) },
        screen: "player",
        filter: "ALL",
        activeBadgeId: "delts",
        unlockQueue: [],
      };
      return reducer(merged, { type: "INIT", saved: merged });
    }

    case "RESET":
      return defaultState();

    case "ANSWER_SURVEY":
      return { ...state, surveyAnswers: { ...state.surveyAnswers, [action.qId]: action.idx } };

    case "SET_AGE":
      return { ...state, age: action.idx };

    case "SET_PROFILE_FIELD": {
      if (!["heightCm", "sex", "exactAge", "calorieGoal"].includes(action.field)) return state;
      return { ...state, [action.field]: action.value };
    }

    case "RECALC_RMR":
      return {
        ...state,
        rmr: restingMetabolicRate({
          weightKg: state.weight,
          heightCm: state.heightCm,
          age: state.exactAge,
          sex: state.sex,
        }),
        ...(action.calorieGoal ? { calorieGoal: action.calorieGoal } : {}),
      };

    case "BUMP_WEIGHT":
      return { ...state, weight: Math.max(40, Math.min(180, state.weight + action.delta)) };

    case "COMPLETE_SURVEY": {
      const { split } = baselineFromAnswers(state.surveyAnswers);
      const attributeBase = Object.fromEntries(split.map((s) => [s.key, s.val]));
      const rmr = restingMetabolicRate({
        weightKg: state.weight,
        heightCm: state.heightCm,
        age: state.exactAge,
        sex: state.sex,
      });
      const next = {
        ...state,
        rmr,
        attributeBase,
        attributeBumps: {},
        lastActivity: {},
        onboarded: true,
        screen: "player",
        streak: 1,
        onboardedAt: state.onboardedAt || todayKey(),
      };
      const snap = { ...maybeRollWeekSnapshot({ ...next, snapshotWeekKey: null }) };
      return withSeasonPeak({ ...next, ...snap });
    }

    case "RETAKE_SURVEY":
      return { ...state, onboarded: false, surveyAnswers: {} };

    case "NAV":
      return {
        ...state,
        screen: action.screen,
        ...(action.badgeId ? { activeBadgeId: action.badgeId } : {}),
        ...(action.part ? { activePart: action.part } : {}),
      };

    case "SET_UNITS":
      return { ...state, units: action.value };

    case "SET_DAILY_TARGETS":
      return { ...state, dailyTargets: { ...state.dailyTargets, ...action.targets } };

    case "SET_FILTER":
      return { ...state, filter: action.filter };

    case "SET_DECAY_WARNINGS":
      return { ...state, decayWarnings: action.value };

    case "LOG_METRIC": {
      const entry = { date: action.date || todayKey(), amount: action.amount };
      const logs = { ...state.logs, [action.metric]: [...(state.logs[action.metric] || []), entry] };
      let next = { ...state, logs };
      if (action.attr) {
        const bump = applyAttributeBump(next, action.attr);
        next = { ...next, ...bump };
      }
      return settleBadges(next);
    }

    // Sets a metric's total for today (replacing any earlier entries) rather than
    // appending. Used by the Apple Health steps sync, which reports a running
    // daily total — running it twice must not double-count.
    case "SET_METRIC_TODAY": {
      const today = todayKey();
      const previous = (state.logs[action.metric] || [])
        .filter((e) => e.date === today)
        .reduce((a, e) => a + e.amount, 0);
      const logs = {
        ...state.logs,
        [action.metric]: [
          ...(state.logs[action.metric] || []).filter((e) => e.date !== today),
          { date: today, amount: action.amount },
        ],
      };
      let next = { ...state, logs };
      if (action.attr && action.amount > previous) {
        next = { ...next, ...applyAttributeBump(next, action.attr) };
      }
      return settleBadges(next);
    }

    case "SET_RESTING_HR": {
      const entry = { date: todayKey(), amount: action.value };
      const logs = { ...state.logs, restingHR: [...state.logs.restingHR, entry] };
      const baselines = { ...state.baselines };
      if (baselines.restingHR == null) baselines.restingHR = action.value;
      let next = { ...state, logs, baselines, ...applyAttributeBump(state, "REC") };
      return settleBadges(next);
    }

    case "SET_FLAG": {
      const flags = { ...state.flags, [action.flag]: action.value };
      let next = { ...state, flags };
      return settleBadges(next);
    }

    case "DISMISS_LOSS":
      return { ...state, lostQueue: state.lostQueue.slice(1) };

    case "DISMISS_UNLOCK":
      return { ...state, unlockQueue: state.unlockQueue.slice(1) };

    case "REPLAY_UNLOCK":
      return state.lastUnlock ? { ...state, unlockQueue: [...state.unlockQueue, state.lastUnlock] } : state;

    default:
      return state;
  }
}

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

export function AppProvider({ children }) {
  // Starts empty on purpose. The app is behind a login now, so real state arrives
  // from Supabase (or the per-user offline cache) via <CloudSync/> once we know
  // who is signed in — never from a shared browser-wide blob.
  const [state, dispatch] = useReducer(reducer, null, () =>
    reducer(defaultState(), { type: "INIT", saved: null }),
  );

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppProvider");
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error("useAppDispatch must be used inside AppProvider");
  return ctx;
}
