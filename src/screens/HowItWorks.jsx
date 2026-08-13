import { UNLOCK_WEEKS } from "../engine/badgeProgress.js";

const TIER_NAMES = ["Bronze", "Silver", "Gold", "Hall of Fame", "Legend"];

export default function HowItWorks({ nav }) {
  return (
    <div className="screen" style={{ paddingBottom: 32 }}>
      <button className="back-link" onClick={() => nav("profile")}>
        ← PROFILE
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>How it works</h1>
      <p className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "0 0 20px" }}>
        GAIN IT · KEEP IT · LOSE IT
      </p>

      <Section title="YOUR OVERALL">
        One number, built from five attributes — Strength, Endurance, Mobility, Recovery, Speed.
        Every workout, run, meal and night of sleep you log nudges the attribute it belongs to.
        Stop training an attribute and it decays. Your Overall rises AND falls — it says what you
        can do now, not what you once did.
      </Section>

      <Section title="EARNING A BADGE TIER">
        Volume alone unlocks nothing. Each tier demands a streak of consecutive weeks performing at
        that tier's level:
        <div style={{ display: "flex", gap: 6, margin: "12px 0 4px" }}>
          {TIER_NAMES.map((t, i) => (
            <div key={t} className="card" style={{ flex: 1, textAlign: "center", padding: "10px 4px" }}>
              <div className="mono" style={{ fontSize: 8, color: "var(--text-tertiary)" }}>{t.toUpperCase()}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--volt)" }}>{UNLOCK_WEEKS[i]}</div>
              <div className="mono" style={{ fontSize: 8, color: "var(--text-tertiary)" }}>WEEKS</div>
            </div>
          ))}
        </div>
        Miss a week and the unlock streak resets to zero. One monster session proves nothing —
        showing up again and again is the whole game.
      </Section>

      <Section title="KEEPING A TIER — THE BANK">
        Every week you keep performing at your tier's level <b style={{ color: "var(--text-primary)" }}>banks
        one week of cover</b>. Every idle week spends one. Run the bank dry and the badge drops a tier —
        then one more tier for every further idle week. Six good weeks buys six weeks of slack;
        one good week buys one.
      </Section>

      <Section title="CALORIES PLAY BY HARDER RULES">
        Diet undoes progress faster than a missed session, so Macro Governor's cover is earned by
        track record, not banked freely: under a month of consistency forgives nothing, 1–3 months
        forgives one bad week, 3–6 months two, and only a full year of proof forgives six. A bad
        week resets that track record.
      </Section>

      <Section title="THE FLOOR">
        Bronze is yours for good. Starting something is a fact about your past and can never be
        taken away — but every tier above Bronze has to be kept, week after week.
      </Section>

      <Section title="STAYING AHEAD OF A DROP">
        The app warns you before anything is lost: slipping badges show on your Player screen and
        badge cards with the days you have left. Hit the weekly number before the week ends and the
        clock resets.
      </Section>

      <button
        onClick={() => nav("player")}
        style={{ width: "100%", marginTop: 8, padding: 15, borderRadius: 999, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 800, fontSize: 14 }}
      >
        BACK TO MY PLAYER
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="label-mono" style={{ marginBottom: 8 }}>{title}</div>
      <div className="card" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}
