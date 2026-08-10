import ProgressBar from "./ProgressBar.jsx";

export default function StatTile({ label, value, note, pct, onClick, empty, emptyHint = "TAP TO LOG" }) {
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
        // An untouched tile gets a dashed outline and a prompt instead of sitting
        // there as a dead grey "0" — the first run should look like an invitation.
        border: empty ? "1px dashed rgba(200,241,53,.28)" : "1px solid var(--border-faint)",
        background: empty ? "rgba(200,241,53,.03)" : "var(--surface-1)",
        transition: "border-color .2s ease, background .2s ease",
      }}
    >
      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--text-tertiary)" }}>
        {label.toUpperCase()}
      </span>
      <span style={{ fontSize: 22, fontWeight: 800, color: empty ? "rgba(241,245,234,.45)" : "var(--text-primary)" }}>
        {value}
      </span>
      {pct != null && !empty && <ProgressBar pct={pct} height={4} />}
      {empty ? (
        <span className="mono" style={{ fontSize: 10, color: "var(--volt)", letterSpacing: "0.08em" }}>
          {emptyHint}
        </span>
      ) : (
        note && (
          <span className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
            {note}
          </span>
        )
      )}
    </Tag>
  );
}
