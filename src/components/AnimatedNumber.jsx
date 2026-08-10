import { useEffect, useRef, useState } from "react";
import { getCaptureProgress, prefersReducedMotion } from "../lib/captureProgress.js";

const easeOut = (p) => 1 - Math.pow(1 - p, 3);

/**
 * Counts up to `value`. Climbing a rating should feel like it moved, not like a
 * number was swapped out — so the Overall ticks up whenever it changes.
 *
 * `from` lets a tier-up animate from the previous figure rather than zero.
 */
export default function AnimatedNumber({ value, from = 0, duration = 1100, className, style }) {
  const capture = getCaptureProgress();
  const reduced = prefersReducedMotion();
  const [shown, setShown] = useState(() => (capture != null || reduced ? value : from));
  const raf = useRef(null);
  const prev = useRef(from);

  useEffect(() => {
    if (capture != null) {
      setShown(Math.round(from + (value - from) * easeOut(capture)));
      return;
    }
    if (reduced) {
      setShown(value);
      return;
    }

    const start = performance.now();
    const origin = prev.current;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(Math.round(origin + (value - origin) * easeOut(p)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else prev.current = value;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, from, duration, capture, reduced]);

  return (
    <span className={className} style={style}>
      {shown}
    </span>
  );
}
