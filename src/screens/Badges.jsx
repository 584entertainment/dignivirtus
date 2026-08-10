import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { BADGES } from "../data/badges.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import BadgeEmblem from "../components/BadgeEmblem.jsx";
import ProgressBar from "../components/ProgressBar.jsx";

const FILTERS = ["ALL", "STR", "END", "MOB", "REC", "SPD"];

export default function Badges({ nav }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const views = BADGES.map((b, i) => computeBadgeView(b, state, i));
  const started = views.filter((v) => v.tier !== "locked").length;
  const gold = views.filter((v) => ["gold", "hof", "legend"].includes(v.tier)).length;
  const legend = views.filter((v) => v.tier === "legend").length;
  const shown = state.filter === "ALL" ? views : views.filter((v) => v.attr === state.filter);

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: "4px 0 4px" }}>Badges</h1>
      <div className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 16 }}>
        {started} OF 20 STARTED · {gold} GOLD · {legend} LEGEND
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
        {FILTERS.map((f) => {
          const active = state.filter === f;
          return (
            <button
              key={f}
              onClick={() => dispatch({ type: "SET_FILTER", filter: f })}
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? "var(--volt)" : "var(--border-soft)"}`,
                background: active ? "var(--volt)" : "var(--surface-2)",
                color: active ? "#141906" : "var(--text-secondary)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {shown.map((b) => (
          <button
            key={b.id}
            onClick={() => nav("detail", b.id)}
            className="card badge-card"
            style={{
              position: "relative",
              overflow: "hidden",
              textAlign: "left",
              opacity: b.opacity,
              boxShadow: b.glowShadow,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {b.tier !== "locked" && <div className="sheen" style={{ animationDelay: b.foilDelay }} />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <BadgeEmblem shape={b.shape} tier={b.tier} size={40} />
              <span className="mono" style={{ fontSize: 9, color: b.tierColor, letterSpacing: "0.08em" }}>
                {b.tierLabel}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, minHeight: 32, lineHeight: 1.3 }}>{b.name}</div>
            <ProgressBar pct={b.pct} color={b.tierColor === "rgba(241,245,234,.4)" ? "var(--volt)" : b.tierColor} height={4} />
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: b.pct >= 75 ? b.tierColor : "var(--text-tertiary)",
                animation: b.pct >= 75 ? "callOutPulse 1.8s ease-in-out infinite" : "none",
              }}
            >
              {b.hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
