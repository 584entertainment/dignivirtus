// Default "log one unit of progress" action per metric, used by the generic quick-log
// button on Badge Detail. sleepHours/restingHR/best1kmSplit need an actual value typed
// in (a duration or a heart rate isn't a simple "+1"), so they're handled with a small
// inline form in BadgeDetail.jsx instead of a fixed increment here.
export const QUICK_LOG = {
  lateralDeltSets: { amount: 1, label: "+1 set", attr: "STR" },
  posteriorChainSets: { amount: 1, label: "+1 set", attr: "STR" },
  hangSeconds: { amount: 20, label: "+20s hang", attr: "STR" },
  pressingSets: { amount: 1, label: "+1 set", attr: "STR" },
  steps: { amount: 1000, label: "+1,000 steps", attr: "END" },
  gpsKm: { amount: 1, label: "+1 km", attr: "END" },
  zone2Minutes: { amount: 10, label: "+10 min zone 2", attr: "END" },
  floors: { amount: 5, label: "+5 floors", attr: "END" },
  hipMobilityMinutes: { amount: 5, label: "+5 min", attr: "MOB" },
  deepSquatHolds: { amount: 1, label: "+1 hold", attr: "MOB" },
  rotationMinutes: { amount: 5, label: "+5 min", attr: "MOB" },
  foldHoldSeconds: { amount: 30, label: "+30s hold", attr: "MOB" },
  water: { amount: 0.25, label: "+250ml", attr: "REC" },
  restDays: { amount: 1, label: "Log a rest day", attr: "REC" },
  sprintsOver90: { amount: 1, label: "+1 sprint", attr: "SPD" },
  negSplitRuns: { amount: 1, label: "+1 run", attr: "SPD" },
  accelerations: { amount: 1, label: "+1 start", attr: "SPD" },
};
