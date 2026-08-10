// When the dev capture harness sets `window.__CAPTURE_T` (0..1), animated widgets
// render that exact point of their animation instead of running on a timer. That
// makes it possible to shoot a deterministic frame sequence of the real UI
// animating, rather than faking the motion in the video editor.
export function getCaptureProgress() {
  if (typeof window === "undefined") return null;
  const t = window.__CAPTURE_T;
  return typeof t === "number" ? Math.max(0, Math.min(1, t)) : null;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
