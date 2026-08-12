import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { SURVEY, AGES, baselineFromAnswers } from "../data/survey.js";
import { ATTRIBUTES } from "../data/attributes.js";
import ProgressBar from "../components/ProgressBar.jsx";

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 14px",
        borderRadius: 999,
        border: `1px solid ${active ? "rgba(200,241,53,.6)" : "var(--border-soft)"}`,
        background: active ? "rgba(200,241,53,.16)" : "var(--surface-2)",
        color: active ? "var(--volt)" : "var(--text-secondary)",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export default function BaselineSurvey() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { surveyAnswers, age, weight, heightCm, sex, exactAge, calorieGoal } = state;

  const allAnswered =
    SURVEY.every((q) => surveyAnswers[q.id] != null) &&
    age != null && heightCm != null && sex != null && exactAge != null && calorieGoal != null;
  const preview = allAnswered ? baselineFromAnswers(surveyAnswers) : null;

  return (
    <div className="screen" style={{ paddingBottom: 40 }}>
      <div className="label-mono">BASELINE</div>
      <h1 style={{ fontSize: 30, fontWeight: 900, margin: "6px 0 8px" }}>First we rate you.</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5, margin: "0 0 22px" }}>
        Seven honest questions and two numbers. This sets your starting point — everything after is earned
        from what you actually log.
      </p>

      <div style={{ marginBottom: 22 }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8 }}>
          AGE
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {AGES.map((label, i) => (
            <Chip key={label} active={age === i} onClick={() => dispatch({ type: "SET_AGE", idx: i })}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8 }}>
          BODYWEIGHT
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <button
            onClick={() => dispatch({ type: "BUMP_WEIGHT", delta: -2 })}
            style={circleBtnStyle}
          >
            −
          </button>
          <span style={{ fontSize: 26, fontWeight: 800, minWidth: 80, textAlign: "center" }}>{weight} kg</span>
          <button onClick={() => dispatch({ type: "BUMP_WEIGHT", delta: 2 })} style={circleBtnStyle}>
            +
          </button>
        </div>
        <p className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 8, lineHeight: 1.5 }}>
          THESE NUMBERS NEVER SCORE YOU. HEIGHT, WEIGHT, AGE AND SEX SET YOUR RESTING METABOLIC RATE —
          THE BAR YOUR CALORIE BADGE IS JUDGED AGAINST.
        </p>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8 }}>
          HEIGHT (CM) &amp; EXACT AGE
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="number"
            value={heightCm ?? ""}
            onChange={(e) => {
              const v = Number(e.target.value);
              dispatch({ type: "SET_PROFILE_FIELD", field: "heightCm", value: v > 0 ? v : null });
            }}
            placeholder="Height in cm (e.g. 180)"
            style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: 12, color: "var(--text-primary)" }}
          />
          <input
            type="number"
            value={exactAge ?? ""}
            onChange={(e) => {
              const v = Number(e.target.value);
              dispatch({ type: "SET_PROFILE_FIELD", field: "exactAge", value: v > 0 ? v : null });
            }}
            placeholder="Age (e.g. 31)"
            style={{ width: 110, background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: 12, color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8 }}>
          SEX (FOR THE METABOLIC FORMULA)
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["male", "Male"], ["female", "Female"]].map(([val, label]) => (
            <Chip key={val} active={sex === val} onClick={() => dispatch({ type: "SET_PROFILE_FIELD", field: "sex", value: val })}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8 }}>
          CALORIE GOAL
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["cut", "Cut — eat below my rate"], ["build", "Build — eat above it"]].map(([val, label]) => (
            <Chip key={val} active={calorieGoal === val} onClick={() => dispatch({ type: "SET_PROFILE_FIELD", field: "calorieGoal", value: val })}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      {SURVEY.map((q) => (
        <div key={q.id} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 14, marginBottom: 10, lineHeight: 1.4 }}>{q.label}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {q.opts.map((label, i) => (
              <Chip
                key={label}
                active={surveyAnswers[q.id] === i}
                onClick={() => dispatch({ type: "ANSWER_SURVEY", qId: q.id, idx: i })}
              >
                {label}
              </Chip>
            ))}
          </div>
        </div>
      ))}

      {preview && (
        <div className="card pop-in" style={{ position: "relative", overflow: "hidden", marginTop: 8, background: `linear-gradient(160deg, var(--hero-grad-top), var(--hero-grad-mid) 60%, var(--hero-grad-bottom))`, border: "1px solid var(--border-volt)" }}>
          <div className="sheen" />
          <div className="label-mono">YOUR BASE OVERALL</div>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, margin: "8px 0 14px" }}>{preview.overall}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {preview.split.map((s) => {
              const meta = ATTRIBUTES.find((a) => a.key === s.key);
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="mono" style={{ fontSize: 11, width: 30, color: "var(--text-secondary)" }}>
                    {s.key}
                  </span>
                  <div style={{ flex: 1 }}>
                    <ProgressBar pct={s.val} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, width: 24, textAlign: "right" }}>{s.val}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 14, lineHeight: 1.5 }}>
            Everyone lands between 26 and 62. From here a point is earned, never given, and the climb
            steepens every ten.
          </p>
        </div>
      )}

      <button
        disabled={!allAnswered}
        onClick={() => dispatch({ type: "COMPLETE_SURVEY" })}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "16px",
          borderRadius: 999,
          border: "none",
          background: allAnswered ? "var(--volt)" : "var(--surface-2)",
          color: allAnswered ? "#141906" : "var(--text-tertiary)",
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: "0.04em",
        }}
      >
        LOCK IT IN
      </button>
    </div>
  );
}

const circleBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "1px solid var(--border-soft)",
  background: "var(--surface-2)",
  color: "var(--text-primary)",
  fontSize: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
