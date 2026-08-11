import { useAppDispatch } from "../engine/store.jsx";
import { BADGE_MAP } from "../data/badges.js";
import { TIERS } from "../data/tiers.js";
import BadgeEmblem from "../components/BadgeEmblem.jsx";

/**
 * The counterweight to the Unlock celebration. A lost tier is told plainly and
 * without theatrics — no shame, just the fact and the way back.
 */
export default function TierLost({ loss, nav }) {
  const dispatch = useAppDispatch();
  const badge = BADGE_MAP[loss.badgeId];
  const from = TIERS[loss.fromTier];
  const to = TIERS[loss.toTier];

  const close = (screen) => {
    dispatch({ type: "DISMISS_LOSS" });
    if (screen) nav(screen, badge.id);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "calc(24px + env(safe-area-inset-top, 0px)) 24px calc(24px + env(safe-area-inset-bottom, 0px))",
        background: "radial-gradient(circle at 50% 40%, rgba(226,96,60,.13), var(--bg-base) 68%)",
      }}
    >
      <div style={{ maxWidth: 340, width: "100%", textAlign: "center" }}>
        <span className="mono rise-in" style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--warn)" }}>
          TIER LOST
        </span>

        <div className="rise-in" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, margin: "26px 0 22px" }}>
          <div style={{ opacity: 0.35 }}>
            <BadgeEmblem shape={badge.shape} tier={loss.fromTier} size={72} />
          </div>
          <span className="mono" style={{ color: "var(--warn)", fontSize: 20 }}>→</span>
          <BadgeEmblem shape={badge.shape} tier={loss.toTier} size={92} />
        </div>

        <h2 className="rise-in" style={{ fontSize: 23, fontWeight: 900, margin: "0 0 8px" }}>
          {badge.name}
        </h2>
        <p className="mono rise-in" style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 16 }}>
          {from.label} → {to.label}
        </p>
        <p className="rise-in" style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 28 }}>
          The work stopped, so the tier did too. Start logging again and you can take it straight back —
          nothing about the climb resets.
        </p>

        <button
          onClick={() => close("detail")}
          style={{ width: "100%", padding: 15, borderRadius: 999, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 800, marginBottom: 10 }}
        >
          WIN IT BACK
        </button>
        <button
          onClick={() => close(null)}
          style={{ width: "100%", padding: 15, borderRadius: 999, border: "1px solid var(--border-soft)", background: "transparent", color: "var(--text-primary)", fontWeight: 700 }}
        >
          NOT NOW
        </button>
      </div>
    </div>
  );
}
