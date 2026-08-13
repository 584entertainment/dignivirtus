import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { useAuth } from "../lib/auth.jsx";
import { useRouter } from "../router.jsx";
import { computeOverall, baselineOverall } from "../engine/overall.js";
import { BAND_CURVE, bandForScore } from "../data/attributes.js";
import { BADGES } from "../data/badges.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import { daysAgo } from "../engine/dateUtils.js";

export default function Profile({ nav }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { user, signOut } = useAuth();
  const { navigate } = useRouter();
  const { overall, attrs, band } = computeOverall(state);
  const startedAt = baselineOverall(state);
  const days = state.onboardedAt ? daysAgo(state.onboardedAt) : 0;

  const badgeViews = BADGES.map((b, i) => computeBadgeView(b, state, i));
  const started = badgeViews.filter((v) => v.tier !== "locked").length;
  const goldPlus = badgeViews.filter((v) => ["gold", "hof", "legend"].includes(v.tier)).length;

  const stats = [
    { label: "BADGES STARTED", value: `${started} / ${BADGES.length}` },
    { label: "GOLD OR BETTER", value: String(goldPlus) },
    { label: "CURRENT STREAK", value: `${state.streak} d` },
    { label: "SEASON PEAK", value: String(state.seasonPeak || overall) },
  ];

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <button className="back-link" onClick={() => nav("player")}>
        ← PLAYER
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17 }}>
          {state.avatarInitials}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{state.name}</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            BASE {startedAt} → NOW {overall} · {days} DAYS
          </div>
        </div>
      </div>

      <div className="label-mono" style={{ marginBottom: 10 }}>
        THE CLIMB
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, marginBottom: 8 }}>
          {BAND_CURVE.map((b) => {
            const on = bandForScore(overall) === b.band || BAND_CURVE.findIndex((x) => x.band === b.band) <= BAND_CURVE.findIndex((x) => x.band === band);
            const h = Math.max(10, b.threshold);
            return (
              <div key={b.band} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ height: `${h}%`, borderRadius: 4, background: on ? "var(--volt)" : "rgba(255,255,255,.12)" }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {BAND_CURVE.map((b) => (
            <span key={b.band} className="mono" style={{ flex: 1, textAlign: "center", fontSize: 10, color: band === b.band ? "var(--volt)" : "var(--text-tertiary)" }}>
              {b.band}
            </span>
          ))}
        </div>
        <p className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 12, lineHeight: 1.5 }}>
          EACH BAND COSTS MORE THAN THE LAST — THE CLIMB STEEPENS EVERY TEN POINTS.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="mono" style={{ fontSize: 9, color: "var(--text-tertiary)", marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="label-mono" style={{ marginBottom: 10 }}>
        HOW YOUR OVERALL IS BUILT
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {attrs.map((a) => (
          <div key={a.key} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</span>
              <span style={{ fontSize: 15, fontWeight: 800 }}>
                {a.val}
                <span className="mono" style={{ fontSize: 11, color: a.delta > 0 ? "var(--good)" : a.delta < 0 && state.decayWarnings ? "var(--warn)" : "var(--text-tertiary)", marginLeft: 6 }}>
                  {a.delta > 0 ? `+${a.delta}` : a.delta < 0 ? a.delta : "—"}
                </span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{a.how}</p>
          </div>
        ))}
      </div>

      <div className="label-mono" style={{ marginBottom: 10 }}>
        DAILY TARGETS
      </div>
      <div className="card" style={{ marginBottom: 22, display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { key: "steps", label: "Steps", step: 500 },
          { key: "water", label: state.units === "imperial" ? "Water (oz)" : "Water (L)", step: 0.1 },
          { key: "sets", label: "Training sets", step: 1 },
          { key: "calories", label: "Calories (kcal)", step: 50 },
        ].map((t) => (
          <div key={t.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 12 }}>{t.label}</span>
            <input
              type="number"
              step={t.step}
              value={
                t.key === "water" && state.units === "imperial"
                  ? Math.round((state.dailyTargets?.water ?? 3.2) * 33.814)
                  : state.dailyTargets?.[t.key] ?? ""
              }
              placeholder={t.key === "calories" ? String(state.rmr || "—") : ""}
              onChange={(e) => {
                let v = Number(e.target.value);
                if (!Number.isFinite(v) || v < 0) return;
                if (t.key === "water" && state.units === "imperial") v = v / 33.814;
                dispatch({ type: "SET_DAILY_TARGETS", targets: { [t.key]: v || null } });
              }}
              style={{ width: 110, textAlign: "right", background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: 8, color: "var(--text-primary)" }}
            />
          </div>
        ))}
        <p className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>
          THE APP NUDGES YOU AT MIDDAY AND EVENING IF A TARGET IS SLIPPING.
        </p>
      </div>

      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span className="mono" style={{ fontSize: 12 }}>Units</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["metric", "imperial"].map((u) => (
            <button
              key={u}
              onClick={() => dispatch({ type: "SET_UNITS", value: u })}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${state.units === u ? "var(--border-volt)" : "var(--border-soft)"}`,
                background: state.units === u ? "var(--volt)" : "var(--surface-2)",
                color: state.units === u ? "#141906" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {u === "metric" ? "KM · KG · L" : "MI · LB · OZ"}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <span className="mono" style={{ fontSize: 12 }}>Decay warnings</span>
        <button
          onClick={() => dispatch({ type: "SET_DECAY_WARNINGS", value: !state.decayWarnings })}
          style={{
            width: 44,
            height: 26,
            borderRadius: 999,
            border: "1px solid var(--border-soft)",
            background: state.decayWarnings ? "var(--volt)" : "var(--surface-2)",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: state.decayWarnings ? 20 : 2,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: state.decayWarnings ? "#141906" : "var(--text-secondary)",
              transition: "left 0.15s ease",
            }}
          />
        </button>
      </div>

      <button
        onClick={() => nav("how")}
        style={{ width: "100%", marginBottom: 10, padding: 14, borderRadius: 999, border: "1px solid var(--border-volt)", background: "rgba(200,241,53,.08)", color: "var(--volt)", fontWeight: 700 }}
      >
        HOW IT WORKS — GAIN, KEEP, LOSE
      </button>

      <button
        disabled={!state.lastUnlock}
        onClick={() => dispatch({ type: "REPLAY_UNLOCK" })}
        style={{ width: "100%", marginBottom: 10, padding: 14, borderRadius: 999, border: "1px solid var(--border-volt)", background: "transparent", color: state.lastUnlock ? "var(--volt)" : "var(--text-tertiary)", fontWeight: 700 }}
      >
        REPLAY LAST UNLOCK
      </button>
      <button
        onClick={() => dispatch({ type: "RETAKE_SURVEY" })}
        style={{ width: "100%", padding: 14, borderRadius: 999, border: "1px solid var(--border-soft)", background: "transparent", color: "var(--text-primary)", fontWeight: 700 }}
      >
        RETAKE BASELINE SURVEY
      </button>

      <button
        onClick={async () => {
          await signOut();
          navigate("/", { replace: true });
        }}
        style={{ width: "100%", marginTop: 10, padding: 14, borderRadius: 999, border: "none", background: "transparent", color: "var(--text-tertiary)", fontWeight: 700, fontSize: 13 }}
      >
        LOG OUT
      </button>

      <p className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", marginTop: 18, lineHeight: 1.6 }}>
        SIGNED IN AS {user?.email || "—"}
        <br />
        YOUR PROGRESS SAVES TO THE CLOUD AUTOMATICALLY
      </p>
    </div>
  );
}
