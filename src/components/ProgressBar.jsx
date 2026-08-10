import { useEffect, useState } from "react";
import { getCaptureProgress, prefersReducedMotion } from "../lib/captureProgress.js";

export default function ProgressBar({
  pct = 0,
  color = "var(--volt)",
  track = "rgba(255,255,255,.08)",
  height = 6,
  animateOnMount = true,
}) {
  const capture = getCaptureProgress();
  const reduced = prefersReducedMotion();
  const target = Math.max(0, Math.min(100, pct));

  // Bars sweep out from empty on first paint so progress reads as something that
  // was earned, rather than a bar that was always sitting there.
  const [width, setWidth] = useState(() =>
    capture != null ? target * capture : reduced || !animateOnMount ? target : 0,
  );

  useEffect(() => {
    if (capture != null) {
      setWidth(target * capture);
      return;
    }
    if (reduced || !animateOnMount) {
      setWidth(target);
      return;
    }
    const id = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(id);
  }, [target, capture, reduced, animateOnMount]);

  return (
    <div style={{ width: "100%", height, borderRadius: 999, background: track, overflow: "hidden" }}>
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          background: color,
          borderRadius: 999,
          transition: capture != null ? "none" : "width 1.1s cubic-bezier(.16,1,.3,1)",
        }}
      />
    </div>
  );
}
