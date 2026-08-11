// Names, blurbs, "how you build it" copy, ladders and units are ported verbatim from
// design_handoff_fitness_overall/Overall v3 Volt.dc.html's BADGES const (final-intent copy).
// The `reqs` shape is redesigned so progress is computed from real logged activity
// (see engine/badgeProgress.js) instead of the prototype's hardcoded sample numbers.

export const BADGES = [
  {
    id: "delt", shape: "wing", attr: "STR", name: "Deltoid Deadeye",
    blurb: "Side delts, hammered every week without fail.",
    how: "Log lateral raise, upright row or cable Y-raise sets. Only sets in the 8-20 rep range count, and a missed week resets the streak.",
    source: "MANUAL LOG", metric: "lateralDeltSets", unit: "SETS PER WEEK", ladder: [6, 12, 20, 32, 50],
    reqs: [
      { kind: "ladder", label: "Lateral delt sets this week", window: "week" },
      { kind: "streakWeeks", label: "Weeks unbroken", window: "week", target: 6, qualifyAt: 6 },
    ],
  },
  {
    id: "hinge", shape: "hinge", attr: "STR", name: "Hinge Master",
    blurb: "Posterior chain volume, week after week.",
    how: "RDLs, good mornings, hip thrusts and back extensions feed it. Your watch judges hinge depth and throws out short reps.",
    source: "MANUAL LOG", metric: "posteriorChainSets", unit: "SETS PER WEEK", ladder: [10, 18, 28, 42, 60],
    reqs: [
      { kind: "ladder", label: "Posterior chain sets this week", window: "week" },
      { kind: "pr", label: "Top set over 1.5x bodyweight", metricFlag: "hingePR" },
    ],
  },
  {
    id: "grip", shape: "grip", attr: "STR", name: "Iron Grip",
    blurb: "Hang until your forearms give out.",
    how: "Dead hangs, farmer carries and any loaded static hold. Time accumulates across the week and resets Monday.",
    source: "MANUAL LOG", metric: "hangSeconds", unit: "SECONDS PER WEEK", ladder: [120, 240, 420, 720, 1200],
    reqs: [{ kind: "ladder", label: "Total hang time", window: "week", unit: "s" }],
  },
  {
    id: "press", shape: "wedge", attr: "STR", name: "Press Authority",
    blurb: "Strict pressing volume, no leg drive.",
    how: "Bench, overhead press and dips feed it. Only sets logged within two reps of failure count toward volume.",
    source: "MANUAL LOG", metric: "pressingSets", unit: "SETS PER WEEK", ladder: [8, 14, 22, 34, 50],
    reqs: [{ kind: "ladder", label: "Pressing sets this week", window: "week" }],
  },
  {
    id: "tenk", shape: "rings", attr: "END", name: "Ten-K Club",
    blurb: "Ten thousand, day after day.",
    how: "Just walk. Steps come straight from your phone and watch, whichever counted more. The bar rises as your tier does.",
    source: "WATCH", metric: "steps", unit: "DAYS PER MONTH", ladder: [8, 16, 26, 29, 30], dailyTarget: 10000,
    reqs: [
      { kind: "target", label: "Steps today", window: "today", target: 10000 },
      { kind: "ladderCount", label: "Qualifying days this month", window: "month", dailyTarget: 10000 },
    ],
  },
  {
    id: "haul", shape: "path", attr: "END", name: "Long Hauler",
    blurb: "Distance under your own power.",
    how: "Walk, run or hike. GPS distance only, so treadmill miles feed Endurance but never this badge.",
    source: "GPS", metric: "gpsKm", unit: "KM PER WEEK", ladder: [18, 28, 40, 65, 100],
    reqs: [{ kind: "ladder", label: "Kilometres this week", window: "week", unit: "km" }],
  },
  {
    id: "zone", shape: "zone", attr: "END", name: "Zone Two",
    blurb: "The boring pace that builds the engine.",
    how: "Time with heart rate between 60 and 70 percent of max. Your watch decides, and it does not round up.",
    source: "WATCH", metric: "zone2Minutes", unit: "MIN PER WEEK", ladder: [60, 100, 150, 240, 360],
    reqs: [{ kind: "ladder", label: "Zone 2 minutes", window: "week", unit: "min" }],
  },
  {
    id: "stairs", shape: "dial", attr: "END", name: "Elevation Junkie",
    blurb: "Altitude, one flight at a time.",
    how: "Floors climbed, read from your phone barometer. Escalators log zero, and it knows.",
    source: "WATCH", metric: "floors", unit: "FLOORS PER WEEK", ladder: [40, 80, 140, 220, 350],
    reqs: [{ kind: "ladder", label: "Floors this week", window: "week" }],
  },
  {
    id: "hip", shape: "arc", attr: "MOB", name: "Hip Opener",
    blurb: "Range you can actually use.",
    how: "Logged mobility minutes: 90-90s, pigeon, cossack squats. Held positions count from 20 seconds up.",
    source: "MANUAL LOG", metric: "hipMobilityMinutes", unit: "MIN PER WEEK", ladder: [35, 60, 90, 150, 240],
    reqs: [{ kind: "ladder", label: "Mobility minutes", window: "week", unit: "min" }],
  },
  {
    id: "ankle", shape: "wedge", attr: "MOB", name: "Ankle Unlocked",
    blurb: "Heels down, all the way down.",
    how: "Deep squat holds of 30 seconds or more, barefoot or in flat shoes. One log per hold.",
    source: "MANUAL LOG", metric: "deepSquatHolds", unit: "HOLDS PER MONTH", ladder: [10, 18, 28, 45, 70],
    reqs: [{ kind: "ladder", label: "Deep squat holds", window: "month" }],
  },
  {
    id: "rotate", shape: "crescent", attr: "MOB", name: "Full Rotation",
    blurb: "A spine that turns both ways.",
    how: "Thoracic rotations, windmills and jefferson curls. Slow tempo logs only; rushed reps are discarded.",
    source: "MANUAL LOG", metric: "rotationMinutes", unit: "MIN PER WEEK", ladder: [20, 35, 60, 100, 160],
    reqs: [{ kind: "ladder", label: "Rotation minutes", window: "week", unit: "min" }],
  },
  {
    id: "fold", shape: "path", attr: "MOB", name: "Forward Fold",
    blurb: "Hamstrings that let you reach.",
    how: "Seated and standing fold holds of 30 seconds or more. Hold time accumulates across the week.",
    source: "MANUAL LOG", metric: "foldHoldSeconds", unit: "SECONDS PER WEEK", ladder: [180, 320, 540, 900, 1500],
    reqs: [{ kind: "ladder", label: "Fold hold time", window: "week", unit: "s" }],
  },
  {
    id: "hydro", shape: "drop", attr: "REC", name: "Hydro Engine",
    blurb: "Three point two litres, every single day.",
    how: "Tap the water button as you drink. Streak length is what pushes a tier, not single big days, and one miss ends it.",
    source: "MANUAL LOG", metric: "water", unit: "DAY STREAK", ladder: [7, 14, 30, 60, 120], dailyTarget: 3.2,
    reqs: [
      { kind: "target", label: "Water today", window: "today", target: 3.2, unit: "L" },
      { kind: "ladderStreakDays", label: "Day streak", dailyTarget: 3.2 },
    ],
  },
  {
    id: "sleep", shape: "crescent", attr: "REC", name: "Deep Sleeper",
    blurb: "Seven and a half, six nights out of seven.",
    how: "Read from your watch overnight. Naps over 40 minutes count toward the daily total.",
    source: "WATCH", metric: "sleepHours", unit: "NIGHTS PER WEEK", ladder: [4, 5, 6, 7, 7], dailyTarget: 7.5,
    reqs: [
      { kind: "ladderCount", label: "Nights over 7.5h", window: "week", dailyTarget: 7.5 },
      { kind: "target", label: "7-night average", window: "rolling7", target: 7.8, unit: "h", agg: "avg" },
    ],
  },
  {
    id: "rest", shape: "rings", attr: "REC", name: "Day Off Artist",
    blurb: "Rest days taken, not skipped.",
    how: "A rest day counts when you log under 20 minutes of training and still hit 6.5 hours of sleep that night.",
    source: "WATCH", metric: "restDays", unit: "DAYS PER MONTH", ladder: [4, 6, 8, 10, 12],
    reqs: [{ kind: "ladder", label: "True rest days this month", window: "month" }],
  },
  {
    id: "idle", shape: "zone", attr: "REC", name: "Idle Engine",
    blurb: "A resting heart rate that keeps dropping.",
    how: "Weekly average resting heart rate from your watch. Tiers are personal: each one is beats below your own starting baseline.",
    source: "WATCH", metric: "restingHR", unit: "BPM BELOW BASELINE", ladder: [2, 5, 9, 14, 20],
    reqs: [{ kind: "baselineDelta", label: "Beats below baseline" }],
  },
  {
    id: "sprint", shape: "bolt", attr: "SPD", name: "Sprint Merchant",
    blurb: "Top-end speed, on purpose.",
    how: "Hit start, run hard, hit stop. GPS grades every effort against your fastest recorded split, so your own progress raises the bar.",
    source: "GPS", metric: "sprintsOver90", unit: "SPRINTS PER MONTH", ladder: [6, 12, 20, 32, 50],
    reqs: [{ kind: "ladder", label: "Sprints above 90% top speed", window: "month" }],
  },
  {
    id: "sub9", shape: "dial", attr: "SPD", name: "Sub-Nine Split",
    blurb: "One kilometre, under four fifteen.",
    how: "Any outdoor kilometre logged with GPS. Only your best split of the week counts toward the tier.",
    source: "GPS", metric: "best1kmSplit", unit: "MIN PER KM", ladder: [5.3, 4.7, 4.15, 3.5, 3.05], invert: true,
    reqs: [{ kind: "best", label: "Best 1km split", window: "week", invert: true }],
  },
  {
    id: "split", shape: "bolt", attr: "SPD", name: "Negative Split",
    blurb: "Finish faster than you started.",
    how: "GPS runs where the second half beats the first. Only runs over 3 km qualify.",
    source: "GPS", metric: "negSplitRuns", unit: "RUNS PER MONTH", ladder: [2, 4, 8, 14, 22],
    reqs: [{ kind: "ladder", label: "Negative-split runs this month", window: "month" }],
  },
  {
    id: "start", shape: "arc", attr: "SPD", name: "Flying Start",
    blurb: "First forty metres, full send.",
    how: "Standing-start accelerations graded by GPS. Top speed has to arrive inside six seconds of go.",
    source: "GPS", metric: "accelerations", unit: "STARTS PER MONTH", ladder: [4, 8, 14, 24, 40],
    reqs: [{ kind: "ladder", label: "Graded accelerations this month", window: "month" }],
  },
];

export const BADGE_MAP = Object.fromEntries(BADGES.map((b) => [b.id, b]));
