import { useEffect, useRef, useState } from "react";
import { TIER_ART, ORDER } from "../data/tiers.js";
import wing from "../assets/badges/wing.png";
import hinge from "../assets/badges/hinge.png";
import grip from "../assets/badges/grip.png";
import rings from "../assets/badges/rings.png";
import path from "../assets/badges/path.png";
import zone from "../assets/badges/zone.png";
import arc from "../assets/badges/arc.png";
import wedge from "../assets/badges/wedge.png";
import drop from "../assets/badges/drop.png";
import crescent from "../assets/badges/crescent.png";
import bolt from "../assets/badges/bolt.png";
import dial from "../assets/badges/dial.png";

const ART = { wing, hinge, grip, rings, path, zone, arc, wedge, drop, crescent, bolt, dial };
const HEX = "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)";

// Ported from design_handoff_fitness_overall/BadgeEmblem.dc.html — the hexagonal
// foil/plate/tint emblem recipe, tier-tinted via CSS filter over a flat silhouette icon.
export default function BadgeEmblem({ shape = "rings", tier = "locked", size = 44, animate, style }) {
  // Flash whenever this badge climbs a tier, so an upgrade is felt in the grid and
  // not only on the full-screen unlock moment.
  const prevTier = useRef(tier);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const climbed = ORDER.indexOf(tier) > ORDER.indexOf(prevTier.current);
    prevTier.current = tier;
    if (!climbed) return;
    setFlash(true);
    const id = setTimeout(() => setFlash(false), 1200);
    return () => clearTimeout(id);
  }, [tier]);

  const w = size;
  const h = Math.round(w * 1.16);
  const t = TIER_ART[tier] || TIER_ART.locked;
  const art = ART[shape] || ART.rings;
  const artSize = Math.round(w * 0.66);
  const rim = Math.max(1.4, w * 0.05);
  const rim2 = Math.max(3.5, w * 0.115);
  const rim3 = Math.max(4.5, w * 0.145);
  const animStyle =
    animate === "bob"
      ? { animation: "emblemBob 4.5s ease-in-out infinite" }
      : animate === "breathe"
        ? { animation: "emblemBreathe 3.4s ease-in-out infinite" }
        : {};

  return (
    <div
      className={flash ? "tier-up" : undefined}
      style={{
        position: "relative",
        flex: "none",
        width: w,
        height: h,
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,.45))",
        ...animStyle,
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, clipPath: HEX, background: t.foil }} />
      <div style={{ position: "absolute", inset: rim, clipPath: HEX, background: t.plate }} />
      <div style={{ position: "absolute", inset: rim2, clipPath: HEX, background: t.foil, opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: rim3, clipPath: HEX, background: t.plate }} />
      <img
        src={art}
        alt=""
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: artSize,
          height: artSize,
          transform: "translate(-50%,-50%)",
          objectFit: "contain",
          filter: t.tint,
          opacity: t.op,
        }}
      />
    </div>
  );
}
