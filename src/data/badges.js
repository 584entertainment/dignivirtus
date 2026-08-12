// Badge catalog v2. Strength is body-part specific (one badge per muscle group),
// speed badges are distance-graded sprints (50m / 20m), and Macro Governor judges
// calorie days against the player's own resting metabolic rate (see lib/nutrition.js).
// The `reqs` shape is computed from real logged activity in engine/badgeProgress.js.

export const BADGES = [
  // ---- STRENGTH — one badge per body part ----
  {
    id: "delts", shape: "wing", attr: "STR", name: "Deltoid Deadeye",
    blurb: "Side delts, hammered every week without fail.",
    how: "Log lateral raise, upright row or cable Y-raise sets from the delts log.",
    source: "MANUAL LOG", metric: "deltSets", unit: "SETS PER WEEK", ladder: [6, 12, 20, 32, 50],
    reqs: [{ kind: "ladder", label: "Delt sets this week", window: "week" }],
  },
  {
    id: "chest", shape: "wedge", attr: "STR", name: "Plate Pressure",
    blurb: "Pressing volume that moves the plates.",
    how: "Bench press, incline press, dips and flyes feed it. Log each working set.",
    source: "MANUAL LOG", metric: "chestSets", unit: "SETS PER WEEK", ladder: [8, 14, 22, 34, 50],
    reqs: [{ kind: "ladder", label: "Chest sets this week", window: "week" }],
  },
  {
    id: "back", shape: "path", attr: "STR", name: "Wingspan Warden",
    blurb: "Rows and pulls, week after week.",
    how: "Pull-ups, rows, pulldowns and pullovers. Log each working set.",
    source: "MANUAL LOG", metric: "backSets", unit: "SETS PER WEEK", ladder: [8, 14, 22, 34, 50],
    reqs: [{ kind: "ladder", label: "Back sets this week", window: "week" }],
  },
  {
    id: "arms", shape: "arc", attr: "STR", name: "Curl Corridor",
    blurb: "Biceps and triceps, isolated and honest.",
    how: "Curls, extensions, pushdowns and skullcrushers. Log each working set.",
    source: "MANUAL LOG", metric: "armSets", unit: "SETS PER WEEK", ladder: [6, 12, 20, 32, 50],
    reqs: [{ kind: "ladder", label: "Arm sets this week", window: "week" }],
  },
  {
    id: "traps", shape: "dial", attr: "STR", name: "Yoke Broker",
    blurb: "The neckline that fills a doorway.",
    how: "Shrugs, high pulls and carries. Log each working set.",
    source: "MANUAL LOG", metric: "trapSets", unit: "SETS PER WEEK", ladder: [4, 8, 14, 22, 36],
    reqs: [{ kind: "ladder", label: "Trap sets this week", window: "week" }],
  },
  {
    id: "glutes", shape: "hinge", attr: "STR", name: "Hinge Master",
    blurb: "Glute volume, week after week.",
    how: "Hip thrusts, glute bridges and kickbacks feed it. Log each working set.",
    source: "MANUAL LOG", metric: "gluteSets", unit: "SETS PER WEEK", ladder: [6, 12, 20, 32, 50],
    reqs: [{ kind: "ladder", label: "Glute sets this week", window: "week" }],
  },
  {
    id: "hams", shape: "crescent", attr: "STR", name: "Posterior Physics",
    blurb: "Hamstrings built with intent.",
    how: "RDLs, leg curls, good mornings and Nordic drops. Log each working set.",
    source: "MANUAL LOG", metric: "hamstringSets", unit: "SETS PER WEEK", ladder: [6, 10, 16, 26, 40],
    reqs: [{ kind: "ladder", label: "Hamstring sets this week", window: "week" }],
  },
  {
    id: "quads", shape: "zone", attr: "STR", name: "Quad Quarry",
    blurb: "Squat-pattern volume, mined weekly.",
    how: "Squats, leg press, lunges and leg extensions. Log each working set.",
    source: "MANUAL LOG", metric: "quadSets", unit: "SETS PER WEEK", ladder: [6, 12, 20, 32, 50],
    reqs: [{ kind: "ladder", label: "Quad sets this week", window: "week" }],
  },
  {
    id: "calves", shape: "bolt", attr: "STR", name: "Ankle Cannons",
    blurb: "Calves that answer every rep.",
    how: "Standing and seated calf raises, full stretch at the bottom. Log each working set.",
    source: "MANUAL LOG", metric: "calfSets", unit: "SETS PER WEEK", ladder: [6, 12, 20, 32, 50],
    reqs: [{ kind: "ladder", label: "Calf sets this week", window: "week" }],
  },
  {
    id: "forearms", shape: "grip", attr: "STR", name: "Iron Grip",
    blurb: "Forearms and grip that never give out.",
    how: "Wrist curls, dead hangs, farmer carries and heavy holds. Log each working set.",
    source: "MANUAL LOG", metric: "forearmSets", unit: "SETS PER WEEK", ladder: [4, 8, 14, 22, 36],
    reqs: [{ kind: "ladder", label: "Forearm sets this week", window: "week" }],
  },

  // ---- ENDURANCE ----
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
    how: "Walk, run or hike with the Run tracker. GPS distance only, so treadmill miles feed Endurance but never this badge.",
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

  // ---- MOBILITY ----
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

  // ---- RECOVERY ----
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
    id: "fuel", shape: "rings", attr: "REC", name: "Macro Governor",
    blurb: "Calorie days kept on your own terms.",
    how: "Log what you eat. A day counts when your total lands on the right side of your resting metabolic rate — under it on a cut, over it on a build.",
    source: "MANUAL LOG", metric: "calories", unit: "DAYS PER MONTH", ladder: [6, 12, 18, 24, 28],
    reqs: [{ kind: "calorieDays", label: "On-target days this month", window: "month" }],
  },

  // ---- SPEED ----
  {
    id: "sprint", shape: "bolt", attr: "SPD", name: "Sprint Merchant",
    blurb: "Fifty metres, full send.",
    how: "Start a tracked run and open up. Any max-effort burst that covers 50 metres or more counts.",
    source: "GPS", metric: "sprints50m", unit: "SPRINTS PER MONTH", ladder: [4, 8, 14, 24, 40],
    reqs: [{ kind: "ladder", label: "50m sprints this month", window: "month" }],
  },
  {
    id: "start", shape: "arc", attr: "SPD", name: "Flying Start",
    blurb: "First twenty metres, off the line.",
    how: "Short accelerations graded by GPS — bursts that cover 20 metres at sprint speed count.",
    source: "GPS", metric: "sprints20m", unit: "STARTS PER MONTH", ladder: [6, 12, 20, 32, 50],
    reqs: [{ kind: "ladder", label: "20m starts this month", window: "month" }],
  },
];

export const BADGE_MAP = Object.fromEntries(BADGES.map((b) => [b.id, b]));
