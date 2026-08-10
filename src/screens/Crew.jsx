import { useEffect, useState } from "react";
import { useAppState } from "../engine/store.jsx";
import { useAuth } from "../lib/auth.jsx";
import { computeOverall } from "../engine/overall.js";
import { fetchLeaderboard } from "../engine/sync.js";
import { BADGES } from "../data/badges.js";
import { computeBadgeView } from "../engine/badgeProgress.js";
import BadgeEmblem from "../components/BadgeEmblem.jsx";

export default function Crew() {
  const state = useAppState();
  const { user } = useAuth();
  const { overall } = computeOverall(state);

  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);

  const badgeViews = BADGES.map((b, i) => computeBadgeView(b, state, i));
  const bestBadge = [...badgeViews].sort((a, b) => b.pct - a.pct)[0];
  const started = badgeViews.filter((b) => b.tier !== "locked").length;

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard()
      .then((data) => !cancelled && setRows(data))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [overall]);

  // Show our own live number rather than whatever was last synced.
  const board = (rows || []).map((r) =>
    r.id === user?.id ? { ...r, overall, display_name: `${state.name} (you)`, me: true } : r,
  );
  if (rows && user && !board.some((r) => r.me)) {
    board.push({
      id: user.id,
      display_name: `${state.name} (you)`,
      avatar_initials: state.avatarInitials,
      overall,
      me: true,
    });
  }
  board.sort((a, b) => b.overall - a.overall);

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "4px 0 4px" }}>Crew</h1>
      <div className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 18 }}>
        {rows ? `${board.length} PLAYER${board.length === 1 ? "" : "S"} · LIVE BOARD` : "LOADING BOARD…"}
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 18, borderColor: "rgba(226,96,60,.35)" }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            Couldn't reach the leaderboard. Your own progress is still saved — pull down to try again
            later.
          </p>
        </div>
      )}

      {!rows && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="card"
              style={{ height: 68, opacity: 0.5, animation: "breatheGlow 1.4s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}

      {rows && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {board.map((c, i) => (
            <div
              key={c.id}
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
                {i + 1}
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
                {c.avatar_initials || "PL"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.display_name}
                </div>
                <div className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                  {c.me ? `${started} BADGES STARTED` : "CLIMBING"}
                </div>
              </div>
              {c.me && <BadgeEmblem shape={bestBadge.shape} tier={bestBadge.tier} size={26} />}
              <div style={{ textAlign: "right", minWidth: 34 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: c.me ? "var(--volt)" : "var(--text-primary)" }}>
                  {c.overall}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rows && board.length < 3 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>
            QUIET IN HERE
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
            You're one of the first. Every new player who signs up shows up on this board — send
            dignivirtus.com to someone who thinks they'd beat you.
          </p>
        </div>
      )}

      <div className="card">
        <div className="label-mono" style={{ marginBottom: 8 }}>
          RARITY WATCH
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
          Gold sits at 4% of players and Hall of Fame at 0.6% — if someone here is flashing one, that's a
          real outlier, not a lucky week.
        </p>
      </div>
    </div>
  );
}
