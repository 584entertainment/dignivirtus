import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { BADGE_MAP } from "../data/badges.js";
import { TIERS, RARITY } from "../data/tiers.js";
import { computeOverall } from "../engine/overall.js";
import BadgeEmblem from "../components/BadgeEmblem.jsx";
import burstBg from "../assets/generated/unlock-backdrop.jpg";

// Ported spark positions from Overall v3 Volt.dc.html's `sparks` array.
const SPARKS = [
  [12, 190, 3, 4.2, 0], [24, 150, 2, 5, 1.2], [38, 250, 3, 4.6, 2.1], [50, 170, 2, 5.4, 0.6],
  [64, 235, 4, 4.8, 1.7], [80, 160, 2, 5.2, 2.6], [70, 275, 2, 4.4, 3.2], [90, 210, 3, 5, 2.9],
].map(([left, top, size, dur, delay]) => ({ left, top, size, dur, delay }));

export default function Unlock({ unlock, nav }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const badge = BADGE_MAP[unlock.badgeId];
  const tier = TIERS[unlock.toTier];
  const { overall, attrs } = computeOverall(state);
  const attr = attrs.find((a) => a.key === badge.attr);

  const close = (screen) => {
    dispatch({ type: "DISMISS_UNLOCK" });
    nav(screen);
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
        overflow: "hidden",
        background: "radial-gradient(circle at 50% 40%, rgba(232,132,60,.16), var(--bg-base) 70%)",
      }}
    >
      {/* The burst is capped to the phone column and faded at the edges. Left
          full-bleed it blows out to the full desktop width and drowns the text. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(560px, 100%)",
          backgroundImage: `url(${burstBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          opacity: 0.4,
          mixBlendMode: "screen",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 45%, #000 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 45%, #000 30%, transparent 78%)",
        }}
      />
      {/* Scrim so the copy always keeps contrast over the brightest part of the burst. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 52%, rgba(11,13,9,.72), rgba(11,13,9,.35) 60%, transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,233,168,.10) 40deg, transparent 90deg, rgba(200,241,53,.08) 200deg, transparent 260deg)",
          animation: "raySweep 30s linear infinite",
        }}
      />
      {SPARKS.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}px`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "var(--foil-pale)",
            animation: `sparkFloat ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 340 }}>
        <span className="label-mono rise-in" style={{ marginBottom: 18 }}>
          BADGE UPGRADED
        </span>
        <div className="pop-in" style={{ marginBottom: 18 }}>
          <BadgeEmblem shape={badge.shape} tier={unlock.toTier} size={168} animate="breathe" style={{ filter: `drop-shadow(0 10px 40px ${tier.color}99)` }} />
        </div>
        <span
          className="mono rise-in"
          style={{ padding: "5px 14px", borderRadius: 999, border: `1px solid ${tier.color}`, color: tier.color, fontSize: 12, letterSpacing: "0.1em", marginBottom: 14 }}
        >
          {tier.label}
        </span>
        <h2 className="rise-in" style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>
          {badge.name}
        </h2>
        <p className="rise-in" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>
          {badge.blurb}
        </p>
        <p className="mono rise-in" style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 20 }}>
          {RARITY[unlock.toTier] || ""}
        </p>

        <div className="rise-in" style={{ display: "flex", gap: 10, marginBottom: 26 }}>
          <span style={chipStyle}>
            {badge.attr} {attr ? attr.val : ""}
          </span>
          <span style={chipStyle}>OVERALL {overall}</span>
        </div>

        <button onClick={() => close("player")} style={{ width: 260, padding: 15, borderRadius: 999, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 800, marginBottom: 10 }}>
          SEE MY PLAYER
        </button>
        <button onClick={() => close("crew")} style={{ width: 260, padding: 15, borderRadius: 999, border: "1px solid var(--border-soft)", background: "transparent", color: "var(--text-primary)", fontWeight: 700 }}>
          SHOW THE CREW
        </button>
      </div>
    </div>
  );
}

const chipStyle = {
  padding: "8px 14px",
  borderRadius: 999,
  background: "var(--surface-1)",
  border: "1px solid var(--border-soft)",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
};
