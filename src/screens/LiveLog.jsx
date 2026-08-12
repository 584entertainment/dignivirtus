import { useEffect, useState } from "react";
import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { BADGE_MAP } from "../data/badges.js";
import { BODY_PART_MAP, BODY_PARTS } from "../data/bodyParts.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import { todayKey } from "../engine/dateUtils.js";
import BadgeEmblem from "../components/BadgeEmblem.jsx";

function sumToday(entries) {
  const t = todayKey();
  return (entries || []).filter((e) => e.date === t).reduce((a, e) => a + e.amount, 0);
}

export default function LiveLog({ nav }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const part = BODY_PART_MAP[state.activePart] || BODY_PARTS[0];
  const badge = BADGE_MAP[part.badgeId];
  const view = computeBadgeView(badge, state);
  const primary = view.reqs[0];
  const todayCount = sumToday(state.logs[part.metric]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const logSet = () => dispatch({ type: "LOG_METRIC", metric: part.metric, amount: 1, attr: "STR" });

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <button className="back-link" onClick={() => nav("log")}>
        ← CHOOSE
      </button>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{part.label}</h1>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            LIVE · {mm}:{ss} · {todayCount} SETS TODAY
          </span>
        </div>
        <span
          className="mono"
          style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--warn)", fontSize: 12 }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warn)", animation: "pillPulse 1.2s ease-in-out infinite" }} />
          REC
        </span>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {part.exercises.map((ex) => (
          <div key={ex.key} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
              <button
                onClick={logSet}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--volt)",
                  color: "#141906",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={logSet}
        style={{ width: "100%", marginTop: 14, padding: 14, borderRadius: 999, border: "1px solid var(--border-volt)", background: "rgba(200,241,53,.10)", color: "var(--volt)", fontWeight: 700, fontSize: 14 }}
      >
        + LOG A SET (ANY {part.label.toUpperCase()} EXERCISE)
      </button>

      <button
        onClick={() => nav("detail", part.badgeId)}
        className="card"
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left", marginTop: 18 }}
      >
        <BadgeEmblem shape={badge.shape} tier={view.tier} size={34} />
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
            FEEDS {badge.name.toUpperCase()}
          </div>
          <div className="mono" style={{ fontSize: 11, color: primary.done ? "var(--good)" : "var(--volt)", marginTop: 3 }}>
            {primary.valText} THIS WEEK
          </div>
        </div>
        <span className="mono" style={{ fontSize: 16, color: "var(--volt)" }}>→</span>
      </button>

      <p className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
        EVERY SET IS ROUTED TO THE BADGE IT ACTUALLY MOVES.
      </p>
    </div>
  );
}
