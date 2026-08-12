// Daily-target reminders (native app only). Content is computed at schedule
// time, so we reschedule on every launch and every trip to the background —
// the copy always reflects the latest synced progress.

import { LocalNotifications } from "@capacitor/local-notifications";
import { isNativeApp } from "./nativeHealth.js";
import { todayKey } from "../engine/dateUtils.js";

const MIDDAY_ID = 1;
const EVENING_ID = 2;

function sumToday(entries) {
  const t = todayKey();
  return (entries || []).filter((e) => e.date === t).reduce((a, e) => a + e.amount, 0);
}

/** Today's progress against each configured daily target. */
export function targetProgress(state) {
  const t = state.dailyTargets || {};
  const sets = [
    "deltSets", "chestSets", "backSets", "armSets", "trapSets",
    "gluteSets", "hamstringSets", "quadSets", "calfSets", "forearmSets",
  ].reduce((a, k) => a + sumToday(state.logs[k]), 0);
  const items = [
    { key: "steps", label: "steps", target: t.steps, current: sumToday(state.logs.steps), fmt: (v) => v.toLocaleString() },
    { key: "water", label: "water", target: t.water, current: sumToday(state.logs.water), fmt: (v) => `${v.toFixed(1)}L` },
    { key: "sets", label: "sets", target: t.sets, current: sets, fmt: (v) => String(v) },
    { key: "calories", label: "kcal", target: t.calories, current: sumToday(state.logs.calories), fmt: (v) => v.toLocaleString() },
  ].filter((i) => i.target > 0);
  return items.map((i) => ({ ...i, pct: Math.min(100, (i.current / i.target) * 100) }));
}

function slackerLine(items, threshold) {
  const behind = items.filter((i) => i.pct < threshold);
  if (!behind.length) return null;
  const worst = behind.sort((a, b) => a.pct - b.pct)[0];
  return `${worst.fmt(worst.current)} / ${worst.fmt(worst.target)} ${worst.label} — ${
    behind.length > 1 ? `${behind.length} goals need work.` : "still time to close it."
  }`;
}

function at(hour, minute) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

export async function rescheduleReminders(state) {
  if (!isNativeApp()) return;
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return;

    await LocalNotifications.cancel({ notifications: [{ id: MIDDAY_ID }, { id: EVENING_ID }] });

    const items = targetProgress(state);
    if (!items.length) return;
    const now = new Date();
    const toSchedule = [];

    const midday = at(12, 30);
    const middayBody = slackerLine(items, 50);
    if (midday > now && middayBody) {
      toSchedule.push({
        id: MIDDAY_ID,
        title: "Halfway check — you're behind",
        body: middayBody,
        schedule: { at: midday },
      });
    }

    const evening = at(19, 30);
    const eveningBody = slackerLine(items, 100);
    if (evening > now && eveningBody) {
      toSchedule.push({
        id: EVENING_ID,
        title: "Today isn't finished",
        body: eveningBody,
        schedule: { at: evening },
      });
    }

    if (toSchedule.length) await LocalNotifications.schedule({ notifications: toSchedule });
  } catch {
    // Notifications are a nice-to-have; never let them break the app.
  }
}
