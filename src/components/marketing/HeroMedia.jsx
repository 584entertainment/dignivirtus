import { useRef, useState } from "react";
import BadgeEmblem from "../BadgeEmblem.jsx";

import heroVideo from "../../assets/generated/hero.mp4";
import heroPoster from "../../assets/generated/hero-poster.jpg";

const HERO_VIDEO = heroVideo;

const LADDER = ["bronze", "silver", "gold", "hof", "legend"];
const SHAPES = ["wing", "bolt", "rings", "drop", "dial"];

/**
 * Hero visual. Renders the hype video when one exists, and until then shows a
 * designed emblem panel rather than an empty player — the live page should never
 * look like a broken video box while we wait on footage.
 */
export default function HeroMedia() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  if (!HERO_VIDEO) {
    return (
      <div className="hero-media hero-media--placeholder">
        <div className="sheen" />
        <div className="hm-glow" />
        <div className="hm-emblems">
          {LADDER.map((tier, i) => (
            <div key={tier} className="hm-emblem" style={{ animationDelay: `${i * 0.45}s` }}>
              <BadgeEmblem shape={SHAPES[i]} tier={tier} size={i === 2 ? 92 : 62} />
            </div>
          ))}
        </div>
        <div className="hm-caption">
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--volt)" }}>
            20 BADGES · 6 TIERS
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>
            Bronze is common. Legend is 0.04% of players.
          </div>
        </div>
      </div>
    );
  }

  // Autoplay is only permitted while muted — every modern browser blocks sound
  // until the user asks for it, hence the explicit unmute control.
  return (
    <div className="hero-media">
      <video
        ref={videoRef}
        src={HERO_VIDEO}
        poster={heroPoster}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="hero-video"
      />
      <button
        className="hm-sound"
        onClick={() => {
          const next = !muted;
          setMuted(next);
          if (videoRef.current) videoRef.current.muted = next;
        }}
        aria-label={muted ? "Unmute video" : "Mute video"}
      >
        {muted ? "🔇 SOUND OFF" : "🔊 SOUND ON"}
      </button>
    </div>
  );
}
