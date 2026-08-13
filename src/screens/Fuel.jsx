import { useState } from "react";
import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { BADGE_MAP } from "../data/badges.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import { todayKey } from "../engine/dateUtils.js";
import ProgressBar from "../components/ProgressBar.jsx";
import BadgeEmblem from "../components/BadgeEmblem.jsx";

function sumToday(entries) {
  const t = todayKey();
  return (entries || []).filter((e) => e.date === t).reduce((a, e) => a + e.amount, 0);
}

export default function Fuel({ nav }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [kcalInput, setKcalInput] = useState("");
  const [setup, setSetup] = useState({ heightCm: "", exactAge: "", sex: null, goal: null });

  const caloriesToday = sumToday(state.logs.calories);
  const rmr = state.rmr;
  const goal = state.calorieGoal;
  const fuelBadge = BADGE_MAP.fuel;
  const view = computeBadgeView(fuelBadge, state);

  const needsSetup = !rmr || !goal;

  const saveSetup = () => {
    const h = Number(setup.heightCm);
    const a = Number(setup.exactAge);
    if (!(h > 0) || !(a > 0) || !setup.sex || !setup.goal) return;
    dispatch({ type: "SET_PROFILE_FIELD", field: "heightCm", value: h });
    dispatch({ type: "SET_PROFILE_FIELD", field: "exactAge", value: a });
    dispatch({ type: "SET_PROFILE_FIELD", field: "sex", value: setup.sex });
    dispatch({ type: "RECALC_RMR", calorieGoal: setup.goal });
  };

  const pct = rmr ? Math.min(100, (caloriesToday / rmr) * 100) : 0;
  const onTrack = rmr && (goal === "cut" ? caloriesToday <= rmr : caloriesToday >= rmr);

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <button className="back-link" onClick={() => nav("log")}>
        ← CHOOSE
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Fuel</h1>
      <p className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "0 0 18px" }}>
        CALORIES VS YOUR RESTING METABOLIC RATE
      </p>

      {needsSetup ? (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>SET YOUR BASELINE</div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" }}>
            Your resting metabolic rate is the calories your body burns doing nothing. We work it out
            from your height, weight, age and sex — then your goal decides which side of it counts.
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              type="number" placeholder="Height (cm)" value={setup.heightCm}
              onChange={(e) => setSetup((s) => ({ ...s, heightCm: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="number" placeholder="Age" value={setup.exactAge}
              onChange={(e) => setSetup((s) => ({ ...s, exactAge: e.target.value }))}
              style={{ ...inputStyle, flex: 0, width: 90 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {[["male", "Male"], ["female", "Female"]].map(([v, l]) => (
              <button key={v} onClick={() => setSetup((s) => ({ ...s, sex: v }))} style={chipStyle(setup.sex === v)}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[["cut", "Cut — eat below"], ["build", "Build — eat above"]].map(([v, l]) => (
              <button key={v} onClick={() => setSetup((s) => ({ ...s, goal: v }))} style={chipStyle(setup.goal === v)}>
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={saveSetup}
            style={{ width: "100%", padding: 13, borderRadius: 999, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 800 }}
          >
            CALCULATE MY RATE
          </button>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 32, fontWeight: 900 }}>{caloriesToday.toLocaleString()}</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                / {rmr.toLocaleString()} KCAL {goal === "cut" ? "CEILING" : "FLOOR"}
              </span>
            </div>
            <ProgressBar pct={pct} color={onTrack ? "var(--good)" : "var(--volt)"} />
            <div className="mono" style={{ fontSize: 11, color: onTrack ? "var(--good)" : "var(--text-secondary)", marginTop: 10 }}>
              {goal === "cut"
                ? onTrack
                  ? `${(rmr - caloriesToday).toLocaleString()} KCAL UNDER — ON TRACK`
                  : `${(caloriesToday - rmr).toLocaleString()} KCAL OVER YOUR RATE`
                : onTrack
                  ? "ABOVE YOUR RATE — BUILD DAY BANKED"
                  : `${(rmr - caloriesToday).toLocaleString()} KCAL TO GO`}
            </div>
          </div>

          <div className="card" style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <input
              type="number"
              value={kcalInput}
              onChange={(e) => setKcalInput(e.target.value)}
              placeholder="Calories eaten (e.g. 650)"
              style={inputStyle}
            />
            <button
              onClick={() => {
                const v = Number(kcalInput);
                if (v > 0) {
                  dispatch({ type: "LOG_METRIC", metric: "calories", amount: v, attr: "REC" });
                  setKcalInput("");
                }
              }}
              style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 700 }}
            >
              Log meal
            </button>
          </div>

          <button
            onClick={() => nav("detail", "fuel")}
            className="card"
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left", marginBottom: 18 }}
          >
            <BadgeEmblem shape={fuelBadge.shape} tier={view.tier} size={34} />
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                FEEDS MACRO GOVERNOR
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--volt)", marginTop: 3 }}>
                {view.reqs[0].valText} ON-TARGET DAYS THIS MONTH
              </div>
            </div>
            <span className="mono" style={{ fontSize: 16, color: "var(--volt)" }}>→</span>
          </button>

          <p className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", lineHeight: 1.6 }}>
            {goal === "cut"
              ? "A CUT DAY ONLY COUNTS ONCE IT'S OVER — FINISH THE DAY UNDER YOUR RATE."
              : "A BUILD DAY COUNTS THE MOMENT YOUR TOTAL CROSSES YOUR RATE."}
            <br />
            DIET COVER NEVER BANKS PAST ONE WEEK — EVERY WEEK HAS TO BE EARNED.
          </p>

          <button
            onClick={() => dispatch({ type: "RECALC_RMR", calorieGoal: goal === "cut" ? "build" : "cut" })}
            style={{ width: "100%", marginTop: 14, padding: 12, borderRadius: 999, border: "1px solid var(--border-soft)", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, fontSize: 12 }}
          >
            SWITCH TO {goal === "cut" ? "BUILD" : "CUT"}
          </button>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  flex: 1,
  background: "var(--surface-2)",
  border: "1px solid var(--border-soft)",
  borderRadius: 10,
  padding: 12,
  color: "var(--text-primary)",
};

function chipStyle(active) {
  return {
    flex: 1,
    padding: "9px 12px",
    borderRadius: 999,
    border: `1px solid ${active ? "rgba(200,241,53,.6)" : "var(--border-soft)"}`,
    background: active ? "rgba(200,241,53,.16)" : "var(--surface-2)",
    color: active ? "var(--volt)" : "var(--text-secondary)",
    fontSize: 13,
    fontWeight: 600,
  };
}
