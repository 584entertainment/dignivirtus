// Ported from design_handoff_fitness_overall/Overall v3 Volt.dc.html (TIERS/GLOWS/RARITY)
// and BadgeEmblem.dc.html (TIER_ART) — the volt-green "current direction" theme.

export const ORDER = ["locked", "bronze", "silver", "gold", "hof", "legend"];

export const TIERS = {
  locked: { label: "LOCKED", color: "rgba(241,245,234,.4)", foil: "rgba(255,255,255,.09)" },
  bronze: { label: "BRONZE", color: "#C08552", foil: "rgba(192,133,82,.45)" },
  silver: { label: "SILVER", color: "#AEB6BD", foil: "rgba(174,182,189,.45)" },
  gold: { label: "GOLD", color: "#D9A94A", foil: "rgba(217,169,74,.5)" },
  hof: { label: "HALL OF FAME", color: "#C9A6E8", foil: "rgba(201,166,232,.5)" },
  legend: { label: "LEGEND", color: "#FFE9A8", foil: "rgba(255,233,168,.55)" },
};

export const GLOWS = {
  locked: "none",
  bronze: "0 0 24px rgba(192,133,82,.13)",
  silver: "0 0 24px rgba(174,182,189,.12)",
  gold: "0 0 28px rgba(217,169,74,.17)",
  hof: "0 0 28px rgba(201,166,232,.17)",
  legend: "0 0 32px rgba(255,233,168,.19)",
};

export const RARITY = {
  bronze: "41% OF PLAYERS",
  silver: "18% OF PLAYERS",
  gold: "4% OF PLAYERS",
  hof: "0.6% OF PLAYERS",
  legend: "0.04% OF PLAYERS",
};

export const TIER_ART = {
  locked: {
    foil: "linear-gradient(150deg,#35322C,#191817)",
    plate: "linear-gradient(155deg,#1D1B18,#111010)",
    tint: "grayscale(1) brightness(.42) contrast(1.1)",
    op: 0.55,
  },
  bronze: {
    foil: "linear-gradient(150deg,#E2AA72,#8A5B33 44%,#4E3018)",
    plate: "linear-gradient(155deg,#402B1A,#19120E)",
    tint: "sepia(.7) saturate(2.1) hue-rotate(-18deg) brightness(.95)",
    op: 1,
  },
  silver: {
    foil: "linear-gradient(150deg,#F2F6FA,#9AA4AD 44%,#565E65)",
    plate: "linear-gradient(155deg,#343A41,#14161A)",
    tint: "grayscale(1) brightness(1.25) contrast(1.05)",
    op: 1,
  },
  gold: {
    foil: "linear-gradient(150deg,#FBEBB4,#D9A94A 42%,#7E5F26)",
    plate: "linear-gradient(155deg,#4E3B17,#1B160D)",
    tint: "saturate(1.25) brightness(1.12)",
    op: 1,
  },
  hof: {
    foil: "linear-gradient(150deg,#F0DEFF,#B489E0 44%,#63428C)",
    plate: "linear-gradient(155deg,#3B2A4D,#16121F)",
    tint: "saturate(1.4) hue-rotate(212deg) brightness(1.15)",
    op: 1,
  },
  legend: {
    foil: "conic-gradient(from 210deg,#FFE9A8,#8FE6D0,#9FB7FF,#E5A6F0,#FFC98A,#FFE9A8)",
    plate: "linear-gradient(155deg,#2C2131,#100E13)",
    tint: "saturate(1.5) brightness(1.35) contrast(1.05)",
    op: 1,
  },
};

export const GOLD = "#C8F135";
export const WARN = "#E2603C";
export const GOOD = "#8FD69B";
export const TXT = "#F1F5EA";
