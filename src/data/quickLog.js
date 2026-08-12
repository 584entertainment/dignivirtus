// Default "log one unit of progress" action per metric, used by the generic quick-log
// button on Badge Detail. sleepHours/restingHR/calories need an actual value typed
// in (a duration or a heart rate isn't a simple "+1"), so they're handled with a small
// inline form in BadgeDetail.jsx or their own screen instead of a fixed increment here.
export const QUICK_LOG = {
  deltSets: { amount: 1, label: "+1 set", attr: "STR" },
  chestSets: { amount: 1, label: "+1 set", attr: "STR" },
  backSets: { amount: 1, label: "+1 set", attr: "STR" },
  armSets: { amount: 1, label: "+1 set", attr: "STR" },
  trapSets: { amount: 1, label: "+1 set", attr: "STR" },
  gluteSets: { amount: 1, label: "+1 set", attr: "STR" },
  hamstringSets: { amount: 1, label: "+1 set", attr: "STR" },
  quadSets: { amount: 1, label: "+1 set", attr: "STR" },
  calfSets: { amount: 1, label: "+1 set", attr: "STR" },
  forearmSets: { amount: 1, label: "+1 set", attr: "STR" },
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
  sprints50m: { amount: 1, label: "+1 sprint", attr: "SPD" },
  sprints20m: { amount: 1, label: "+1 start", attr: "SPD" },
};
