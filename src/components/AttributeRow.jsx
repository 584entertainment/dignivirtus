import ProgressBar from "./ProgressBar.jsx";

export default function AttributeRow({ attr, decayWarnings, onClick }) {
  const deltaText = attr.delta > 0 ? `+${attr.delta}` : attr.delta < 0 ? String(attr.delta) : "—";
  const deltaColor =
    attr.delta > 0 ? "var(--good)" : attr.delta < 0 && decayWarnings ? "var(--warn)" : "var(--text-tertiary)";
  const decaying = attr.delta < 0 && decayWarnings;

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        background: "none",
        border: "none",
        padding: "9px 0",
        textAlign: "left",
      }}
    >
      <span className="mono" style={{ fontSize: 12, width: 30, color: "var(--text-secondary)", flexShrink: 0 }}>
        {attr.key}
      </span>
      <div style={{ flex: 1 }}>
        <ProgressBar pct={attr.val} color="linear-gradient(90deg, var(--tier-bronze), var(--volt))" />
      </div>
      <span style={{ fontWeight: 700, fontSize: 14, width: 26, textAlign: "right", flexShrink: 0 }}>{attr.val}</span>
      <span className="mono" style={{ fontSize: 11, width: 26, textAlign: "right", color: deltaColor, opacity: decaying ? 0.9 : 1, flexShrink: 0 }}>
        {deltaText}
      </span>
    </button>
  );
}
