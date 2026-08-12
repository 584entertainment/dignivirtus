// Resting metabolic rate via Mifflin-St Jeor — the baseline the Macro Governor
// badge and the Fuel screen judge calorie days against.

export function restingMetabolicRate({ weightKg, heightCm, age, sex }) {
  if (!weightKg || !heightCm || !age || !sex) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

/**
 * Whether a day's calorie total lands on the right side of the player's RMR.
 * Cut = eat at or below it; build = eat at or above it.
 */
export function isOnTarget(intakeKcal, state) {
  const rmr = state.rmr;
  if (!rmr || !state.calorieGoal) return false;
  return state.calorieGoal === "cut" ? intakeKcal <= rmr : intakeKcal >= rmr;
}

/**
 * Count on-target days among the given calorie log entries. A cut day only
 * counts once it's over (today's partial total would trivially be "under");
 * a build day counts as soon as the total crosses the line.
 */
export function onTargetDayCount(entries, state, todayStr) {
  if (!state.rmr || !state.calorieGoal) return 0;
  const byDay = {};
  (entries || []).forEach((e) => {
    byDay[e.date] = (byDay[e.date] || 0) + e.amount;
  });
  return Object.entries(byDay).filter(([date, total]) => {
    if (total <= 0) return false;
    if (state.calorieGoal === "cut" && date >= todayStr) return false;
    return isOnTarget(total, state);
  }).length;
}
