import { useState } from "react";
import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { BADGE_MAP } from "../data/badges.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import { todayKey } from "../engine/dateUtils.js";
import BadgeEmblem from "../components/BadgeEmblem.jsx";
import { isNativeApp } from "../lib/nativeHealth.js";

function sumToday(entries) {
  const t = todayKey();
  return (entries || []).filter((e) => e.date === t).reduce((a, e) => a + e.amount, 0);
}

export default function Movement({ nav }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [stepsInput, setStepsInput] = useState("");

  const stepsToday = sumToday(state.logs.steps);
  const pct = Math.min(100, (stepsToday / 10000) * 100);
  const distance = sumToday(state.logs.gpsKm);
  const activeMinutes = sumToday(state.logs.zone2Minutes);
  const decaying = state.decayWarnings && state.lastActivity?.SPD && (Date.now() - new Date(state.lastActivity.SPD).getTime()) / 86400000 > 4;

  const sprintBadge = BADGE_MAP.sprint;
  const sprintView = computeBadgeView(sprintBadge, state);
  const sprintCount = sumToday(state.logs.sprintsOver90) + (state.logs.sprintsOver90 || []).length; // display total logged
  const segmentsFilled = Math.min(6, (state.logs.sprintsOver90 || []).length);

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <button className="back-link" onClick={() => nav("player")}>
        ← PLAYER
      </button>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `conic-gradient(var(--volt) ${pct}%, rgba(255,255,255,.08) ${pct}%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 172, height: 172, borderRadius: "50%", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 38, fontWeight: 900 }}>{stepsToday.toLocaleString()}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
              OF 10,000 STEPS
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <input
          type="number"
          value={stepsInput}
          onChange={(e) => setStepsInput(e.target.value)}
          placeholder="Add steps"
          style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: 10, color: "var(--text-primary)" }}
        />
        <button
          onClick={() => {
            const v = Number(stepsInput);
            if (v > 0) {
              dispatch({ type: "LOG_METRIC", metric: "steps", amount: v, attr: "END" });
              setStepsInput("");
            }
          }}
          style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 700 }}
        >
          Log
        </button>
        <button
          onClick={() => dispatch({ type: "LOG_METRIC", metric: "steps", amount: 1000, attr: "END" })}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border-soft)", background: "var(--surface-2)", color: "var(--text-primary)", fontWeight: 600 }}
        >
          +1,000
        </button>
      </div>

      {isNativeApp() ? (
        <div className="card" style={{ marginBottom: 18, border: "1px solid var(--border-volt)", background: "rgba(200,241,53,.04)" }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>
            SYNCED WITH APPLE HEALTH
          </div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
            Your steps flow in from the Health app automatically every time you open Dignivirtus —
            nothing to log. If the number reads 0, allow step access in Settings → Privacy → Health.
          </p>
        </div>
      ) : (
      <div className="card" style={{ marginBottom: 18, border: "1px solid var(--border-volt)", background: "rgba(200,241,53,.04)" }}>
        <div className="label-mono" style={{ marginBottom: 8 }}>
          AUTO-TRACK WITH APPLE HEALTH
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" }}>
          One two-minute setup and your steps log themselves every evening — no typing.
        </p>
        <ol style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
          <li>
            Open <strong style={{ color: "var(--text-primary)" }}>Shortcuts</strong> → Automation → New →{" "}
            <strong style={{ color: "var(--text-primary)" }}>Time of Day</strong> (e.g. 9:00 pm, daily, Run
            Immediately)
          </li>
          <li>
            Add <strong style={{ color: "var(--text-primary)" }}>Find Health Samples</strong> (type: Steps,
            start date: Today), then <strong style={{ color: "var(--text-primary)" }}>Calculate Statistics</strong>{" "}
            → Sum
          </li>
          <li>
            Add <strong style={{ color: "var(--text-primary)" }}>Open URLs</strong> with{" "}
            <span className="mono" style={{ color: "var(--volt)", fontSize: 11 }}>
              dignivirtus.com/app?steps=
            </span>
            <span className="mono" style={{ fontSize: 11 }}>[Statistics Result]</span>
          </li>
        </ol>
        <p className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", margin: "10px 0 0", lineHeight: 1.6 }}>
          RUNS IN SAFARI, SO LOG IN THERE ONCE. RE-RUNS NEVER DOUBLE-COUNT.
        </p>
      </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        <MiniStat label="DISTANCE" value={`${distance.toFixed(1)} km`} note={distance > 0 ? "LOGGED TODAY" : "NONE YET"} noteColor="var(--good)" />
        <MiniStat label="ACTIVE" value={`${activeMinutes} min`} note="ZONE 2" noteColor="var(--text-tertiary)" />
        <MiniStat label="SPEED" value={state.decayWarnings ? "TRACKED" : "—"} note={decaying ? "STALE" : "ON TRACK"} noteColor={decaying ? "var(--warn)" : "var(--good)"} />
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <BadgeEmblem shape="bolt" tier={sprintView.tier} size={30} />
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
              SPEED WORK · GPS
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {sprintCount} OF {sprintBadge.ladder[Math.min(4, ["locked", "bronze", "silver", "gold", "hof", "legend"].indexOf(sprintView.tier))]}
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 12px" }}>
          Hit start, run hard, hit stop. Every sprint above 90% of your top speed counts toward Sprint Merchant.
        </p>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < segmentsFilled ? "var(--volt)" : "rgba(255,255,255,.08)" }} />
          ))}
        </div>
        <button
          onClick={() => dispatch({ type: "LOG_METRIC", metric: "sprintsOver90", amount: 1, attr: "SPD" })}
          style={{ width: "100%", padding: 13, borderRadius: 999, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 800 }}
        >
          START A TIMED SPRINT
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, note, noteColor }) {
  return (
    <div className="card" style={{ flex: 1, textAlign: "center" }}>
      <div className="mono" style={{ fontSize: 9, color: "var(--text-tertiary)", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{value}</div>
      <div className="mono" style={{ fontSize: 9, color: noteColor, marginTop: 4 }}>
        {note}
      </div>
    </div>
  );
}
