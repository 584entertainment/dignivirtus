// Ported verbatim from Overall v3 Volt.dc.html's SURVEY/AGES consts.
export const SURVEY = [
  { id: "lift", attr: "STR", label: "Days a week you lift weights", opts: ["0-1", "2-3", "4-5", "6+"] },
  { id: "steps", attr: "END", label: "Daily steps, honestly", opts: ["under 4k", "4-7k", "7-10k", "10k+"] },
  { id: "cardio", attr: "SPD", label: "How often you train fast — intervals, sprints, sport", opts: ["never", "once a month", "weekly", "2-3x a week"] },
  { id: "toes", attr: "MOB", label: "Standing, knees straight, how far down your legs can you reach?", opts: ["above knee", "shin", "fingertips to floor", "palms flat"] },
  { id: "sleep", attr: "REC", label: "Sleep on a normal night", opts: ["under 6h", "6-7h", "7-8h", "8h+"] },
  { id: "diet", attr: "REC", label: "How would you rate your diet?", opts: ["poor", "patchy", "solid", "dialled in"] },
  { id: "protein", attr: "REC", label: "Protein at every meal?", opts: ["rarely", "sometimes", "most meals", "tracked, hitting target"] },
];

export const AGES = ["under 25", "25-34", "35-44", "45-54", "55+"];

// score(i) = 26 + i*12, ported from the prototype's baseline scoring formula.
export function baselineFromAnswers(answers) {
  const score = (i) => 26 + i * 12;
  const split = ["STR", "END", "MOB", "REC", "SPD"].map((key) => {
    const qs = SURVEY.filter((q) => q.attr === key);
    const val = Math.round(qs.reduce((a, q) => a + score(answers[q.id] ?? 0), 0) / qs.length);
    return { key, val };
  });
  const overall = Math.round(split.reduce((a, b) => a + b.val, 0) / 5);
  return { split, overall };
}
