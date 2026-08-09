// Ported from Overall v3 Volt.dc.html's ATTRS const — names/keys/explanations are final-intent copy.
export const ATTRIBUTES = [
  {
    key: "STR",
    name: "Strength",
    how: "Working sets that load a muscle group. Only volume above your 4-week average moves the number, so plateaus stall it.",
  },
  {
    key: "END",
    name: "Endurance",
    how: "Steps, GPS distance and time in zone 2. Continuous efforts over 45 minutes count double.",
  },
  {
    key: "MOB",
    name: "Mobility",
    how: "Logged mobility minutes and held end-range positions. Ten minutes daily beats an hour on Sunday.",
  },
  {
    key: "REC",
    name: "Recovery",
    how: "Sleep duration, water and rest days you actually take. Read from your watch overnight.",
  },
  {
    key: "SPD",
    name: "Speed",
    how: "GPS timed efforts only: sprints, and any distance run under a pace target. Decays fastest of the five.",
  },
];

export const BAND_CURVE = [
  { band: "D", threshold: 0 },
  { band: "C", threshold: 20 },
  { band: "B", threshold: 40 },
  { band: "A", threshold: 60 },
  { band: "S", threshold: 80 },
  { band: "HOF", threshold: 95 },
];

export function bandForScore(score) {
  let band = BAND_CURVE[0].band;
  for (const b of BAND_CURVE) {
    if (score >= b.threshold) band = b.band;
  }
  return band;
}
