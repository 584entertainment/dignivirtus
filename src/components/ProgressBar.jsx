export default function ProgressBar({ pct = 0, color = "var(--volt)", track = "rgba(255,255,255,.08)", height = 6 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ width: "100%", height, borderRadius: 999, background: track, overflow: "hidden" }}>
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          background: color,
          borderRadius: 999,
          transition: "width 1.1s cubic-bezier(.16,1,.3,1)",
        }}
      />
    </div>
  );
}
