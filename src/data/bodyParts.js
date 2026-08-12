// The LOG tab's chooser: one entry per body part, each feeding its own metric
// and badge, plus shortcuts to the other logging surfaces.

export const BODY_PARTS = [
  {
    key: "delts", label: "Delts", metric: "deltSets", badgeId: "delts",
    exercises: [
      { key: "lat", name: "Lateral Raise" },
      { key: "ohp-side", name: "Upright Row" },
      { key: "yraise", name: "Cable Y-Raise" },
      { key: "facepull", name: "Face Pull" },
    ],
  },
  {
    key: "chest", label: "Chest", metric: "chestSets", badgeId: "chest",
    exercises: [
      { key: "bench", name: "Bench Press" },
      { key: "incline", name: "Incline Press" },
      { key: "dip", name: "Dips" },
      { key: "fly", name: "Flyes" },
    ],
  },
  {
    key: "back", label: "Back", metric: "backSets", badgeId: "back",
    exercises: [
      { key: "pullup", name: "Pull-Up" },
      { key: "row", name: "Row" },
      { key: "pulldown", name: "Lat Pulldown" },
      { key: "pullover", name: "Pullover" },
    ],
  },
  {
    key: "arms", label: "Arms", metric: "armSets", badgeId: "arms",
    exercises: [
      { key: "curl", name: "Biceps Curl" },
      { key: "hammer", name: "Hammer Curl" },
      { key: "pushdown", name: "Triceps Pushdown" },
      { key: "skull", name: "Skullcrusher" },
    ],
  },
  {
    key: "traps", label: "Traps", metric: "trapSets", badgeId: "traps",
    exercises: [
      { key: "shrug", name: "Shrug" },
      { key: "highpull", name: "High Pull" },
      { key: "carry", name: "Loaded Carry" },
    ],
  },
  {
    key: "glutes", label: "Glutes", metric: "gluteSets", badgeId: "glutes",
    exercises: [
      { key: "thrust", name: "Hip Thrust" },
      { key: "bridge", name: "Glute Bridge" },
      { key: "kickback", name: "Cable Kickback" },
      { key: "abduction", name: "Abduction" },
    ],
  },
  {
    key: "hams", label: "Hamstrings", metric: "hamstringSets", badgeId: "hams",
    exercises: [
      { key: "rdl", name: "Romanian Deadlift" },
      { key: "legcurl", name: "Leg Curl" },
      { key: "goodmorning", name: "Good Morning" },
      { key: "nordic", name: "Nordic Curl" },
    ],
  },
  {
    key: "quads", label: "Quads", metric: "quadSets", badgeId: "quads",
    exercises: [
      { key: "squat", name: "Squat" },
      { key: "legpress", name: "Leg Press" },
      { key: "lunge", name: "Lunge" },
      { key: "extension", name: "Leg Extension" },
    ],
  },
  {
    key: "calves", label: "Calves", metric: "calfSets", badgeId: "calves",
    exercises: [
      { key: "standing", name: "Standing Calf Raise" },
      { key: "seated", name: "Seated Calf Raise" },
    ],
  },
  {
    key: "forearms", label: "Forearms", metric: "forearmSets", badgeId: "forearms",
    exercises: [
      { key: "wrist", name: "Wrist Curl" },
      { key: "hang", name: "Dead Hang" },
      { key: "farmer", name: "Farmer Carry" },
    ],
  },
];

export const BODY_PART_MAP = Object.fromEntries(BODY_PARTS.map((p) => [p.key, p]));

// Non-strength logging lives on its own screens; the chooser links out to them.
export const LOG_SHORTCUTS = [
  { key: "run", label: "Run / Sprint", note: "GPS DISTANCE + SPRINTS", screen: "run" },
  { key: "steps", label: "Movement", note: "STEPS + FLOORS", screen: "rings" },
  { key: "fuel", label: "Fuel", note: "CALORIES", screen: "fuel" },
  { key: "recovery", label: "Recovery", note: "WATER + SLEEP", screen: "quick" },
];
