import { useState } from "react";
import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { BADGE_MAP } from "../data/badges.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import { todayKey, addDaysKey } from "../engine/dateUtils.js";
import { formatVolume } from "../lib/units.js";

function sumToday(entries) {
  const t = todayKey();
  return (entries || []).filter((e) => e.date === t).reduce((a, e) => a + e.amount, 0);
}

export default function Recovery({ nav }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [sleepInput, setSleepInput] = useState("");

  const waterToday = sumToday(state.logs.water);
  const cupsFilled = Math.min(13, Math.round(waterToday / 0.25));

  const hydro = computeBadgeView(BADGE_MAP.hydro, state);
  const streakReq = hydro.reqs.find((r) => r.label === "Day streak");

  const today = todayKey();
  const nights = Array.from({ length: 7 }, (_, i) => {
    const key = addDaysKey(today, -(6 - i));
    const total = (state.logs.sleepHours || []).filter((e) => e.date === key).reduce((a, e) => a + e.amount, 0);
    return { day: new Date(key + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" }), h: total };
  });
  const loggedNights = nights.filter((n) => n.h > 0);
  const avgSleep = loggedNights.length ? loggedNights.reduce((a, n) => a + n.h, 0) / loggedNights.length : 0;

  const sleepBadge = computeBadgeView(BADGE_MAP.sleep, state);

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <button className="back-link" onClick={() => nav("player")}>
        ← PLAYER
      </button>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label-mono" style={{ marginBottom: 8 }}>
          WATER
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
          {(() => {
            const cur = formatVolume(waterToday, state.units, 2);
            const goal = formatVolume(3.2, state.units);
            return (
              <>
                <span style={{ fontSize: 32, fontWeight: 900 }}>{cur.value}{cur.suffix}</span>
                <span className="mono" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                  / {goal.value}{goal.suffix}
                </span>
              </>
            );
          })()}
        </div>
        <button
          onClick={() => dispatch({ type: "LOG_METRIC", metric: "water", amount: 0.25, attr: "REC" })}
          style={{ padding: "10px 20px", borderRadius: 999, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 800, marginBottom: 14 }}
        >
          {state.units === "imperial" ? "+8oz" : "+250ml"}
        </button>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {Array.from({ length: 13 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 20, borderRadius: 4, background: i < cupsFilled ? "var(--volt)" : "rgba(255,255,255,.06)" }} />
          ))}
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          HYDRO ENGINE · DAY {streakReq?.cur ?? 0} OF {streakReq?.target ?? 7} STREAK
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label-mono" style={{ marginBottom: 8 }}>
          SLEEP
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 26, fontWeight: 900 }}>{avgSleep.toFixed(1)}h avg</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 70, marginBottom: 6 }}>
          {nights.map((n, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ width: "100%", height: `${Math.min(100, (n.h / 9) * 100)}%`, borderRadius: 4, background: n.h >= 7.5 ? "var(--volt)" : "rgba(255,255,255,.14)" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {nights.map((n, i) => (
            <span key={i} className="mono" style={{ flex: 1, textAlign: "center", fontSize: 9, color: "var(--text-tertiary)" }}>
              {n.day}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            type="number"
            step="0.1"
            value={sleepInput}
            onChange={(e) => setSleepInput(e.target.value)}
            placeholder="Last night (hours)"
            style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: 10, color: "var(--text-primary)" }}
          />
          <button
            onClick={() => {
              const v = Number(sleepInput);
              if (v > 0) {
                dispatch({ type: "LOG_METRIC", metric: "sleepHours", amount: v, attr: "REC", date: addDaysKey(today, -1) });
                setSleepInput("");
              }
            }}
            style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 700 }}
          >
            Log
          </button>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          DEEP SLEEPER · {sleepBadge.pct}% TO {sleepBadge.nextTierLabel}
        </div>
      </div>

      <div className="card" style={{ background: "rgba(226,96,60,.08)", border: "1px solid rgba(226,96,60,.3)" }}>
        <div className="label-mono" style={{ color: "var(--warn)", marginBottom: 8 }}>
          USE IT OR LOSE IT
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
          Your rating and your badges both move in two directions. Stop doing the work that earned a tier
          and, after a few weeks of warnings, it drops back a step. Bronze is the exception — once you've
          started something, that much is yours for good.
        </p>
      </div>
    </div>
  );
}
