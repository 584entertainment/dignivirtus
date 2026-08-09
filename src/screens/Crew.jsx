import { useAppState } from "../engine/store.jsx";
import { CREW_MOCK } from "../data/crew.js";
import { computeOverall } from "../engine/overall.js";
import { BADGES } from "../data/badges.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import BadgeEmblem from "../components/BadgeEmblem.jsx";

export default function Crew() {
  const state = useAppState();
  const { overall } = computeOverall(state);

  const badgeViews = BADGES.map((b, i) => computeBadgeView(b, state, i));
  const bestBadge = [...badgeViews].sort((a, b) => b.pct - a.pct)[0];

  const me = {
    initials: state.avatarInitials,
    name: `${state.name} (you)`,
    ov: overall,
    delta: "+0",
    note: `${badgeViews.filter((b) => b.tier !== "locked").length} BADGES STARTED`,
    shape: bestBadge.shape,
    tier: bestBadge.tier,
    me: true,
  };

  const board = [...CREW_MOCK, me].sort((a, b) => b.ov - a.ov).map((c, i) => ({ ...c, rank: i + 1 }));

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "4px 0 4px" }}>Crew</h1>
      <div className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 18 }}>
        {board.length - 1} FRIENDS · WEEK BOARD
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {board.map((c) => (
          <div
            key={c.name}
            className="card"
            style={{
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: c.me ? "linear-gradient(140deg,#181F0E,#11150D)" : "var(--surface-1)",
              border: `1px solid ${c.me ? "var(--border-volt)" : "var(--border-faint)"}`,
              boxShadow: c.me ? "0 0 26px rgba(200,241,53,.11)" : "none",
            }}
          >
            {c.me && <div className="sheen" />}
            <span className="mono" style={{ fontSize: 13, color: "var(--text-tertiary)", width: 18 }}>
              {c.rank}
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: c.me ? "linear-gradient(150deg,#232E12,#12170C)" : "var(--surface-2)",
                border: `1px solid ${c.me ? "rgba(200,241,53,.45)" : "var(--border-soft)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
                color: c.me ? "var(--volt)" : "var(--text-secondary)",
                flexShrink: 0,
              }}
            >
              {c.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                {c.note}
              </div>
            </div>
            <BadgeEmblem shape={c.shape} tier={c.tier} size={26} />
            <div style={{ textAlign: "right", minWidth: 40 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: c.me ? "var(--volt)" : "var(--text-primary)" }}>{c.ov}</div>
              <div className="mono" style={{ fontSize: 10, color: c.delta.startsWith("+") ? "var(--good)" : c.delta.startsWith("-") ? "var(--warn)" : "var(--text-tertiary)" }}>
                {c.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="label-mono" style={{ marginBottom: 8 }}>
          RARITY WATCH
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
          Gold sits at 4% of players and Hall of Fame at 0.6% — if someone in your crew is flashing one,
          that's a real outlier, not a lucky week.
        </p>
      </div>
    </div>
  );
}
