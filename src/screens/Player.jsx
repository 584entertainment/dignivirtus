import { useAppState } from "../engine/store.jsx";
import { computeOverall, computeOverallRaw, baselineOverall, sessionsToNextPoint } from "../engine/overall.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import { badgesAtRisk } from "../engine/regression.js";
import { BADGES } from "../data/badges.js";
import { todayKey } from "../engine/dateUtils.js";
import AttributeRow from "../components/AttributeRow.jsx";
import AnimatedNumber from "../components/AnimatedNumber.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import StatTile from "../components/StatTile.jsx";
import BadgeEmblem from "../components/BadgeEmblem.jsx";
import { isNativeApp } from "../lib/nativeHealth.js";
import { targetProgress } from "../lib/reminders.js";

function sumToday(entries) {
  const t = todayKey();
  return (entries || []).filter((e) => e.date === t).reduce((a, e) => a + e.amount, 0);
}

export default function Player({ nav }) {
  const state = useAppState();
  const { overall, attrs, band } = computeOverall(state);
  const raw = computeOverallRaw(state);
  const nextPoint = overall + 1;
  const nextPointPct = Math.max(0, Math.min(100, (raw - overall) * 100));
  const startedAt = baselineOverall(state);
  const sessions = sessionsToNextPoint(overall);
  const decaying = attrs.some((a) => a.delta < 0 && state.decayWarnings);

  const stepsToday = sumToday(state.logs.steps);
  const waterToday = sumToday(state.logs.water);
  const setsToday = [
    "deltSets", "chestSets", "backSets", "armSets", "trapSets",
    "gluteSets", "hamstringSets", "quadSets", "calfSets", "forearmSets",
  ].reduce((a, k) => a + sumToday(state.logs[k]), 0);

  const quests = [
    { label: "HIT 10K STEPS", val: `${stepsToday.toLocaleString()}`, pct: Math.min(100, (stepsToday / 10000) * 100), done: stepsToday >= 10000, go: () => nav("rings") },
    { label: "DRINK 3.2 L", val: `${waterToday.toFixed(1)}L`, pct: Math.min(100, (waterToday / 3.2) * 100), done: waterToday >= 3.2, go: () => nav("quick") },
    { label: "LOG 5 SETS", val: `${setsToday}/5`, pct: Math.min(100, (setsToday / 5) * 100), done: setsToday >= 5, go: () => nav("log") },
  ];
  const questsLeft = quests.filter((q) => !q.done).length;

  const atRisk = badgesAtRisk(state);
  const badgeViews = BADGES.map((b, i) => computeBadgeView(b, state, i));
  const closest = [...badgeViews].filter((b) => b.tier !== "legend").sort((a, b) => b.pct - a.pct)[0] || badgeViews[0];
  const nextLabel = closest.nextTierLabel;

  return (
    <div className="screen">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.14em" }}>
            {(() => {
              const d = new Date();
              const start = new Date(d.getFullYear(), 0, 1);
              const week = Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
              return `WEEK ${week}`;
            })()}
          </span>
          <span
            className="mono"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(232,132,60,.12)",
              color: "var(--streak-orange)",
              fontSize: 11,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--streak-orange)", animation: "pillPulse 1.4s ease-in-out infinite" }} />
            {state.streak}-DAY STREAK
          </span>
        </div>
        <button
          onClick={() => nav("profile")}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--surface-2)",
            border: "1px solid var(--border-soft)",
            color: "var(--text-primary)",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {state.avatarInitials}
        </button>
      </header>

      <div
        className="pop-in"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-card-lg)",
          border: "1px solid var(--border-volt)",
          background: "linear-gradient(160deg, var(--hero-grad-top), var(--hero-grad-mid) 55%, var(--hero-grad-bottom))",
          padding: 20,
          marginBottom: 18,
        }}
      >
        <div className="sheen" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="label-mono">OVERALL</div>
            <div style={{ position: "relative", lineHeight: 1 }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-30px -20px",
                  background: "radial-gradient(circle, rgba(200,241,53,.28), transparent 65%)",
                  animation: "breatheGlow 3.2s ease-in-out infinite",
                }}
              />
              <AnimatedNumber
                value={overall}
                from={0}
                duration={1250}
                style={{
                  position: "relative",
                  display: "inline-block",
                  fontSize: 92,
                  fontWeight: 900,
                  background: "linear-gradient(180deg, var(--foil-pale), var(--foil-mid) 55%, var(--foil-olive))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              />
            </div>
            <div className="mono" style={{ color: "var(--good)", fontSize: 12, marginTop: -4 }}>
              +{Math.max(0, attrs.reduce((a, b) => a + b.delta, 0) > 0 ? Math.round(attrs.reduce((a, b) => a + b.delta, 0) / 5) || 1 : 0)} wk
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 6 }}>
              {state.name} · started at {startedAt}
            </div>
          </div>
          <div style={{ textAlign: "right", minWidth: 90 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", letterSpacing: "0.12em" }}>
              NEXT POINT
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 8px" }}>{nextPoint}</div>
            <ProgressBar pct={nextPointPct} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border-faint)" }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            {sessions} QUALIFYING SESSIONS TO {nextPoint}
          </span>
          <span className="mono" style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, border: "1px solid var(--border-volt)", color: "var(--volt)" }}>
            BAND {band}
          </span>
        </div>
      </div>

      {(() => {
        // Web fallback for the native reminder notifications: after midday,
        // surface any daily target still under 50%.
        if (isNativeApp() || new Date().getHours() < 12) return null;
        const behind = targetProgress(state).filter((i) => i.pct < 50);
        if (!behind.length) return null;
        const worst = behind.sort((a, b) => a.pct - b.pct)[0];
        return (
          <div
            className="card"
            style={{ marginBottom: 18, border: "1px solid var(--border-volt)", background: "rgba(200,241,53,.06)" }}
          >
            <div className="mono" style={{ fontSize: 10, color: "var(--volt)", letterSpacing: "0.12em", marginBottom: 4 }}>
              DAILY TARGET SLIPPING
            </div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {worst.fmt(worst.current)} / {worst.fmt(worst.target)} {worst.label}
              {behind.length > 1 ? ` — and ${behind.length - 1} more behind` : ""}
            </div>
          </div>
        );
      })()}

      {atRisk.length > 0 && (
        <button
          onClick={() => nav("badges")}
          className="card"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            textAlign: "left",
            marginBottom: 18,
            border: "1px solid rgba(226,96,60,.42)",
            background: "rgba(226,96,60,.09)",
          }}
        >
          <BadgeEmblem shape={atRisk[0].badge.shape} tier={atRisk[0].risk.tier} size={38} />
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--warn)", letterSpacing: "0.12em" }}>
              {atRisk.length === 1 ? "1 BADGE SLIPPING" : `${atRisk.length} BADGES SLIPPING`}
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 3 }}>
              {atRisk.length === 1
                ? `${atRisk[0].badge.name} drops in ${atRisk[0].risk.daysLeft} days`
                : "Tiers you earned are about to go"}
            </div>
          </div>
          <span className="mono" style={{ fontSize: 16, color: "var(--warn)" }}>
            →
          </span>
        </button>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span className="label-mono">TODAY'S THREE</span>
        {questsLeft > 0 && (
          <span className="mono" style={{ fontSize: 10, color: "var(--volt)", animation: "callOutPulse 1.8s ease-in-out infinite" }}>
            {questsLeft} MORE KEEPS THE STREAK
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {quests.map((q) => (
          <StatTile
            key={q.label}
            label={q.label}
            value={q.val}
            pct={q.pct}
            onClick={q.go}
            empty={q.pct === 0}
            emptyHint="TAP TO START"
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span className="label-mono">ATTRIBUTES</span>
        {decaying && (
          <span className="mono" style={{ fontSize: 10, color: "var(--warn)" }}>
            1 DECAYING
          </span>
        )}
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        {attrs.map((a) => (
          <AttributeRow key={a.key} attr={a} decayWarnings={state.decayWarnings} onClick={() => nav("profile")} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        <StatTile
          label="Steps"
          value={stepsToday.toLocaleString()}
          pct={Math.min(100, (stepsToday / 10000) * 100)}
          note={`${Math.max(0, 10000 - stepsToday).toLocaleString()} TO TEN-K CLUB`}
          onClick={() => nav("rings")}
          empty={stepsToday === 0}
          emptyHint="ADD TODAY'S STEPS →"
        />
        <StatTile
          label="Recovery"
          value={`${waterToday.toFixed(1)}L`}
          note="TAP TO LOG →"
          onClick={() => nav("quick")}
          empty={waterToday === 0}
          emptyHint="LOG WATER & SLEEP →"
        />
      </div>

      <div className="label-mono" style={{ marginBottom: 8 }}>
        CLOSEST TO UNLOCK
      </div>
      <button
        onClick={() => nav("detail", closest.id)}
        className="card"
        style={{ position: "relative", overflow: "hidden", width: "100%", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}
      >
        <div className="sheen" />
        <BadgeEmblem shape={closest.shape} tier={closest.tier} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{closest.name}</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-secondary)", margin: "3px 0 8px" }}>
            {closest.tierLabel} → {nextLabel}
          </div>
          <ProgressBar pct={closest.pct} />
          <div className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 6 }}>
            {closest.pct}% · {closest.hint}
          </div>
        </div>
      </button>
    </div>
  );
}
