import ProgressBar from "./ProgressBar.jsx";

export default function StatTile({ label, value, note, pct, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className="card"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        textAlign: "left",
        border: "1px solid var(--border-faint)",
      }}
    >
      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--text-tertiary)" }}>
        {label.toUpperCase()}
      </span>
      <span style={{ fontSize: 22, fontWeight: 800 }}>{value}</span>
      {pct != null && <ProgressBar pct={pct} height={4} />}
      {note && (
        <span className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
          {note}
        </span>
      )}
    </Tag>
  );
}
