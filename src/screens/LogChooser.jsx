import { useAppState } from "../engine/store.jsx";
import { BODY_PARTS, LOG_SHORTCUTS } from "../data/bodyParts.js";
import { BADGE_MAP } from "../data/badges.js";
import { todayKey } from "../engine/dateUtils.js";
import BadgeEmblem from "../components/BadgeEmblem.jsx";

function sumToday(entries) {
  const t = todayKey();
  return (entries || []).filter((e) => e.date === t).reduce((a, e) => a + e.amount, 0);
}

export default function LogChooser({ nav }) {
  const state = useAppState();

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>What are you training?</h1>
      <p className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "0 0 18px" }}>
        EVERY SET FEEDS ITS OWN BADGE
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
        {BODY_PARTS.map((p) => {
          const badge = BADGE_MAP[p.badgeId];
          const tier = state.badgeTiers?.[p.badgeId] || "locked";
          const count = sumToday(state.logs[p.metric]);
          return (
            <button
              key={p.key}
              onClick={() => nav("livelog", null, p.key)}
              className="card"
              style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: 12 }}
            >
              <BadgeEmblem shape={badge.shape} tier={tier} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.label}</div>
                <div className="mono" style={{ fontSize: 9, color: count > 0 ? "var(--good)" : "var(--text-tertiary)", marginTop: 2 }}>
                  {count > 0 ? `${count} SETS TODAY` : "NONE TODAY"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="label-mono" style={{ marginBottom: 10 }}>
        EVERYTHING ELSE
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {LOG_SHORTCUTS.map((s) => (
          <button
            key={s.key}
            onClick={() => nav(s.screen)}
            className="card"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", padding: "14px 16px" }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{s.label}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 2 }}>{s.note}</div>
            </div>
            <span className="mono" style={{ fontSize: 16, color: "var(--volt)" }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
