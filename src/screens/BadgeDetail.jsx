import { useState } from "react";
import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { BADGE_MAP } from "../data/badges.js";
import { QUICK_LOG } from "../data/quickLog.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import BadgeEmblem from "../components/BadgeEmblem.jsx";
import ProgressBar from "../components/ProgressBar.jsx";

export default function BadgeDetail({ nav }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [splitInput, setSplitInput] = useState("");
  const [hrInput, setHrInput] = useState("");

  const badge = BADGE_MAP[state.activeBadgeId] || BADGE_MAP.delt;
  const view = computeBadgeView(badge, state);
  const quick = QUICK_LOG[badge.metric];

  const logQuick = () => {
    if (!quick) return;
    dispatch({ type: "LOG_METRIC", metric: badge.metric, amount: quick.amount, attr: quick.attr });
  };

  return (
    <div className="screen" style={{ paddingBottom: 32 }}>
      <button className="back-link" onClick={() => nav("badges")}>
        ← BADGES
      </button>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 24 }}>
        <BadgeEmblem shape={badge.shape} tier={view.tier} size={94} animate="bob" style={{ marginBottom: 14, filter: `drop-shadow(0 6px 22px ${view.tierColor}66)` }} />
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>{badge.name}</h1>
        <div className="mono" style={{ fontSize: 11, color: view.tierColor, marginBottom: 10 }}>
          {view.tierLabel} · {badge.attr}
        </div>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: 320 }}>{badge.blurb}</p>
      </div>

      <div className="label-mono" style={{ marginBottom: 10 }}>
        REQUIREMENTS FOR {view.nextTierLabel}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {view.reqs.map((r) => (
          <div key={r.label} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: r.done ? "var(--text-primary)" : "var(--text-secondary)" }}>{r.label}</span>
              <span className="mono" style={{ color: r.done ? "var(--good)" : view.tierColor }}>
                {r.valText}
              </span>
            </div>
            <ProgressBar pct={r.pct} color={r.done ? "var(--good)" : "var(--volt)"} />
          </div>
        ))}
      </div>

      {quick && (
        <button
          onClick={logQuick}
          style={{ width: "100%", marginBottom: 22, padding: 14, borderRadius: 999, border: "1px solid var(--border-volt)", background: "rgba(200,241,53,.12)", color: "var(--volt)", fontWeight: 700, fontSize: 14 }}
        >
          {quick.label}
        </button>
      )}

      {badge.metric === "restingHR" && (
        <div className="card" style={{ marginBottom: 22, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="number"
            value={hrInput}
            onChange={(e) => setHrInput(e.target.value)}
            placeholder="Resting HR (bpm)"
            style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: 10, color: "var(--text-primary)" }}
          />
          <button
            onClick={() => {
              const v = Number(hrInput);
              if (v > 0) {
                dispatch({ type: "SET_RESTING_HR", value: v });
                setHrInput("");
              }
            }}
            style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 700 }}
          >
            Log
          </button>
        </div>
      )}

      {badge.metric === "best1kmSplit" && (
        <div className="card" style={{ marginBottom: 22, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="number"
            step="0.01"
            value={splitInput}
            onChange={(e) => setSplitInput(e.target.value)}
            placeholder="Split (min/km, e.g. 4.5)"
            style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: 10, color: "var(--text-primary)" }}
          />
          <button
            onClick={() => {
              const v = Number(splitInput);
              if (v > 0) {
                dispatch({ type: "LOG_METRIC", metric: "best1kmSplit", amount: v, attr: "SPD" });
                setSplitInput("");
              }
            }}
            style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 700 }}
          >
            Log
          </button>
        </div>
      )}

      {badge.id === "hinge" && !state.flags.hingePR && (
        <button
          onClick={() => dispatch({ type: "SET_FLAG", flag: "hingePR", value: true })}
          style={{ width: "100%", marginBottom: 22, padding: 12, borderRadius: 999, border: "1px solid var(--border-soft)", background: "var(--surface-2)", color: "var(--text-primary)", fontWeight: 600, fontSize: 13 }}
        >
          Log a top set over 1.5× bodyweight
        </button>
      )}

      <div className="label-mono" style={{ marginBottom: 10 }}>
        TIER LADDER
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 8 }}>
        {view.ladder.map((l) => (
          <div key={l.tier} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 8, borderRadius: 12, background: l.active ? "rgba(200,241,53,.09)" : "var(--surface-1)", border: `1px solid ${l.active ? "var(--border-volt)" : "var(--border-faint)"}` }}>
            <BadgeEmblem shape={badge.shape} tier={l.active ? l.tier : "locked"} size={30} />
            <span className="mono" style={{ fontSize: 8, color: l.active ? view.tierColor : "var(--text-tertiary)", textAlign: "center" }}>
              {l.name}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: l.active ? "var(--text-primary)" : "var(--text-tertiary)" }}>{l.need}</span>
          </div>
        ))}
      </div>
      <p className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 24 }}>
        {badge.unit} · EACH TIER ROUGHLY DOUBLES THE ONE BELOW
      </p>

      <div className="label-mono" style={{ marginBottom: 10 }}>
        HOW YOU BUILD IT
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)", margin: "0 0 12px" }}>{badge.how}</p>
        <span className="mono" style={{ fontSize: 10, padding: "4px 9px", borderRadius: 999, border: "1px solid var(--border-soft)", color: "var(--text-tertiary)" }}>
          TRACKED BY {badge.source}
        </span>
      </div>

      <button
        onClick={() => nav("log")}
        style={{ width: "100%", padding: 16, borderRadius: 999, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 800, fontSize: 15 }}
      >
        START A SESSION FOR THIS
      </button>
    </div>
  );
}
