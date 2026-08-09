const TABS = [
  { id: "player", label: "Player" },
  { id: "badges", label: "Badges" },
  { id: "log", label: "Log" },
  { id: "crew", label: "Crew" },
];

const ICONS = {
  player: (on) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={on ? "var(--volt)" : "currentColor"} strokeWidth="2" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" stroke={on ? "var(--volt)" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  badges: (on) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2 21 7v10L12 22 3 17V7z"
        stroke={on ? "var(--volt)" : "currentColor"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  log: (on) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={on ? "var(--volt)" : "currentColor"} strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke={on ? "var(--volt)" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  crew: (on) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="8.5" cy="8" r="3" stroke={on ? "var(--volt)" : "currentColor"} strokeWidth="2" />
      <circle cx="16" cy="9.5" r="2.4" stroke={on ? "var(--volt)" : "currentColor"} strokeWidth="2" />
      <path d="M2.5 20c1-3.6 3.8-5.6 6-5.6s5 2 6 5.6" stroke={on ? "var(--volt)" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
      <path d="M14.5 15c2 .2 4 1.7 5 5" stroke={on ? "var(--volt)" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export default function TabBar({ active, onNav }) {
  return (
    <nav
      style={{
        position: "fixed",
        left: "50%",
        bottom: 0,
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 8px calc(10px + env(safe-area-inset-bottom))",
        background: "rgba(11,13,9,.88)",
        backdropFilter: "blur(14px)",
        borderTop: "1px solid var(--border-faint)",
        zIndex: 20,
      }}
    >
      {TABS.map((t) => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onNav(t.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              color: on ? "var(--volt)" : "var(--text-tertiary)",
              flex: 1,
            }}
          >
            {ICONS[t.id](on)}
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.06em" }}>
              {t.label.toUpperCase()}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
