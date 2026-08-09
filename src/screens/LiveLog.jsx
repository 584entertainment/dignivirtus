import { useEffect, useState } from "react";
import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { BADGE_MAP } from "../data/badges.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import { todayKey } from "../engine/dateUtils.js";
import BadgeEmblem from "../components/BadgeEmblem.jsx";

const EXERCISES = [
  { key: "lat", name: "Lateral Raise", target: "3 × 12-15 · 12kg", unit: "sets", metric: "lateralDeltSets", attr: "STR", badgeId: "delt", amount: 1 },
  { key: "face", name: "Face Pull", target: "3 × 15 · cable", unit: "sets", metric: "lateralDeltSets", attr: "STR", badgeId: "delt", amount: 1 },
  { key: "rdl", name: "Romanian Deadlift", target: "4 × 8 · 95kg", unit: "sets", metric: "posteriorChainSets", attr: "STR", badgeId: "hinge", amount: 1 },
  { key: "hang", name: "Dead Hang", target: "to failure", unit: "s", metric: "hangSeconds", attr: "STR", badgeId: "grip", amount: 20 },
];

function sumToday(entries) {
  const t = todayKey();
  return (entries || []).filter((e) => e.date === t).reduce((a, e) => a + e.amount, 0);
}

export default function LiveLog() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Upper Body Push</h1>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            LIVE · {mm}:{ss}
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
        {EXERCISES.map((ex) => {
          const badge = BADGE_MAP[ex.badgeId];
          const view = computeBadgeView(badge, state);
          const primary = view.reqs[0];
          const count = sumToday(state.logs[ex.metric]);
          const status = primary.done ? "MAXED" : primary.pct >= 70 ? `${(primary.target - primary.cur).toFixed(primary.target % 1 ? 1 : 0)} TO GO` : primary.valText;
          const statusColor = primary.done ? "var(--good)" : primary.pct >= 70 ? "var(--volt)" : "var(--text-tertiary)";

          return (
            <div key={ex.key} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>
                    {ex.target}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 26, fontWeight: 800 }}>
                    {count}
                    <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>{ex.unit}</span>
                  </span>
                  <button
                    onClick={() => dispatch({ type: "LOG_METRIC", metric: ex.metric, amount: ex.amount, attr: ex.attr })}
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-faint)" }}>
                <BadgeEmblem shape={badge.shape} tier={view.tier} size={26} />
                <span className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", flex: 1 }}>
                  FEEDS {badge.name.toUpperCase()}
                </span>
                <span
                  className="mono"
                  style={{ fontSize: 10, color: statusColor, animation: primary.pct >= 70 && !primary.done ? "callOutPulse 1.6s ease-in-out infinite" : "none" }}
                >
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
        EVERY SET IS ROUTED TO THE BADGES IT ACTUALLY MOVES.
      </p>
    </div>
  );
}
