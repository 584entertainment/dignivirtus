import BadgeEmblem from "../BadgeEmblem.jsx";

// Sample figures for marketing only — real players start from their own survey.
const DEMO = {
  overall: 61,
  attrs: [
    ["STR", 68],
    ["END", 64],
    ["MOB", 51],
    ["REC", 63],
    ["SPD", 58],
  ],
};

/** The product shot: real app UI, reused wherever the page needs proof. */
export default function PlayerCard({ tilt = true }) {
  return (
    <div className="player-card" style={tilt ? undefined : { transform: "none" }}>
      <div className="sheen" />
      <div className="label-mono">OVERALL</div>
      <div className="pc-ovr foil">{DEMO.overall}</div>
      <div className="mono" style={{ color: "var(--good)", fontSize: 12, marginTop: 8 }}>
        +1 this week
      </div>

      <div style={{ marginTop: 20 }}>
        {DEMO.attrs.map(([key, val], i) => (
          <div className="pc-attr-row" key={key}>
            <span className="pc-attr-key">{key}</span>
            <span className="pc-bar">
              <span style={{ width: `${val}%`, animationDelay: `${i * 0.09}s` }} />
            </span>
            <span className="pc-attr-val">{val}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 22,
          paddingTop: 16,
          borderTop: "1px solid var(--border-faint)",
        }}
      >
        <BadgeEmblem shape="wing" tier="silver" size={38} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Deltoid Deadeye</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
            SILVER → GOLD · 62%
          </div>
        </div>
      </div>
    </div>
  );
}
