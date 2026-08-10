import { useRouter } from "../router.jsx";
import { useAuth } from "../lib/auth.jsx";
import BadgeEmblem from "../components/BadgeEmblem.jsx";
import { ATTRIBUTES } from "../data/attributes.js";
import { BADGES } from "../data/badges.js";
import { TIERS, RARITY } from "../data/tiers.js";
import appIcon from "../assets/generated/app-icon.svg";
import burst from "../assets/generated/unlock-backdrop.jpg";

// Sample figures purely for the marketing card — real players start from their survey.
const DEMO = { overall: 61, attrs: [["STR", 68], ["END", 64], ["MOB", 51], ["REC", 63], ["SPD", 58]] };

const LADDER = ["bronze", "silver", "gold", "hof", "legend"];

const STEPS = [
  {
    n: "01",
    title: "Get rated",
    body: "Seven honest questions set your starting line. Everyone lands between 26 and 62 — nobody starts elite.",
  },
  {
    n: "02",
    title: "Log what you actually do",
    body: "Sets, steps, water, sleep, sprints. Each one is routed to the exact badges and attributes it moves.",
  },
  {
    n: "03",
    title: "Watch the number fight back",
    body: "Points get harder the higher you climb. A rating in the eighties costs several times what the fifties did.",
  },
];

export default function Landing() {
  const { navigate } = useRouter();
  const { session } = useAuth();

  const marqueeShapes = [...new Set(BADGES.map((b) => b.shape))];
  const marquee = [...marqueeShapes, ...marqueeShapes];
  const tierOfIndex = (i) => LADDER[Math.min(LADDER.length - 1, i)];

  return (
    <div className="lp">
      <div className="lp-grain" />

      <nav className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <div className="lp-brand">
            <img src={appIcon} alt="" />
            Dignivirtus
          </div>
          <div className="lp-nav-actions">
            {session ? (
              <button className="btn btn-primary" onClick={() => navigate("/app")}>
                Open the app
              </button>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => navigate("/login")}>
                  Log in
                </button>
                <button className="btn btn-primary" onClick={() => navigate("/signup")}>
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ---------------- hero ---------------- */}
      <header className="lp-hero">
        <div className="lp-wrap lp-hero-grid">
          <div>
            <span className="eyebrow">The fitness tracker that rates you</span>
            <h1 className="lp-h1">
              You have an <span className="foil">Overall</span>. Now go earn it.
            </h1>
            <p className="lp-sub">
              Dignivirtus scores you from 0 to 100 across five athletic attributes, then makes you prove
              it. Twenty badges, six tiers, and a number that only moves when you do.
            </p>
            <div className="lp-cta-row">
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/signup")}>
                Get Started
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate("/login")}>
                I have an account
              </button>
            </div>
            <p className="lp-note">FREE · NO CARD · TAKES ABOUT TWO MINUTES</p>
          </div>

          <div className="card-3d">
            <div className="player-card">
              <div className="sheen" />
              <div className="label-mono">OVERALL</div>
              <div className="pc-ovr foil">{DEMO.overall}</div>
              <div className="mono" style={{ color: "var(--good)", fontSize: 12, marginTop: 8 }}>
                +1 this week
              </div>
              <div style={{ marginTop: 20 }}>
                {DEMO.attrs.map(([key, val], i) => (
                  <div className="pc-attr-row" key={key}>
                    <span className="pc-attr-key">{key}</span>
                    <span className="pc-bar">
                      <span style={{ width: `${val}%`, animationDelay: `${i * 0.09}s` }} />
                    </span>
                    <span className="pc-attr-val">{val}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 22,
                  paddingTop: 16,
                  borderTop: "1px solid var(--border-faint)",
                }}
              >
                <BadgeEmblem shape="wing" tier="silver" size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Deltoid Deadeye</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                    SILVER → GOLD · 62%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- emblem marquee ---------------- */}
      <div className="lp-marquee" aria-hidden="true">
        <div className="lp-marquee-track">
          {marquee.map((shape, i) => (
            <BadgeEmblem key={`${shape}-${i}`} shape={shape} tier={tierOfIndex(i % 5)} size={46} />
          ))}
        </div>
      </div>

      {/* ---------------- attributes ---------------- */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <span className="label-mono">THE RATING</span>
            <h2 className="lp-h2">Five attributes. One number you can't fake.</h2>
            <p className="lp-lead">
              Your Overall is built from five separate scores. Each one only responds to the work that
              actually builds it, so you can't grind one number and call yourself complete.
            </p>
          </div>
          <div className="lp-grid lp-grid-3">
            {ATTRIBUTES.map((a) => (
              <div className="lp-card" key={a.key}>
                <span className="attr-chip">{a.key}</span>
                <h3>{a.name}</h3>
                <p>{a.how}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- badges + tiers ---------------- */}
      <section className="lp-section" style={{ borderTop: "1px solid var(--border-faint)" }}>
        <div className="lp-wrap">
          <div className="lp-section-head">
            <span className="label-mono">THE COLLECTION</span>
            <h2 className="lp-h2">Twenty badges. Six tiers. Most people never see Legend.</h2>
            <p className="lp-lead">
              Every badge tracks one real metric and each tier roughly doubles the one below it. Earned
              tiers are permanent — once you've taken Gold, it's yours for good.
            </p>
          </div>

          <div className="tier-row">
            {LADDER.map((tier) => (
              <div className="tier-cell" key={tier}>
                <BadgeEmblem shape="rings" tier={tier} size={52} style={{ margin: "0 auto" }} />
                <div className="tier-name" style={{ color: TIERS[tier].color }}>
                  {TIERS[tier].label === "HALL OF FAME" ? "HALL OF FAME" : TIERS[tier].label}
                </div>
                <div className="tier-rarity">{RARITY[tier].split("%")[0]}%</div>
                <div className="tier-of">OF PLAYERS</div>
              </div>
            ))}
          </div>

          <div className="lp-grid lp-grid-2" style={{ marginTop: 14 }}>
            {BADGES.slice(0, 4).map((b) => (
              <div className="lp-card" key={b.id} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <BadgeEmblem shape={b.shape} tier="gold" size={50} />
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>{b.name}</h3>
                  <p style={{ fontSize: 13 }}>{b.blurb}</p>
                  <div className="mono" style={{ fontSize: 10, color: "var(--volt)", marginTop: 8 }}>
                    {b.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- how it works ---------------- */}
      <section className="lp-section" style={{ borderTop: "1px solid var(--border-faint)" }}>
        <div className="lp-wrap">
          <div className="lp-section-head">
            <span className="label-mono">HOW IT WORKS</span>
            <h2 className="lp-h2">Rate. Log. Climb.</h2>
          </div>
          <div className="lp-grid lp-grid-3">
            {STEPS.map((s) => (
              <div className="lp-card" key={s.n}>
                <span className="step-num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- the honest bit ---------------- */}
      <section className="lp-section" style={{ borderTop: "1px solid var(--border-faint)" }}>
        <div className="lp-wrap lp-grid lp-grid-2">
          <div>
            <span className="label-mono">THE CATCH</span>
            <h2 className="lp-h2">Badges are permanent. Your rating isn't.</h2>
            <p className="lp-lead">
              Tiers you've earned can never be taken away. Attributes are the opposite — stop doing the
              work and they slide, and Speed slides fastest of all. It's the honest version of a fitness
              score, and you can switch the warnings off if you'd rather not see them.
            </p>
          </div>
          <div className="lp-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <BadgeEmblem shape="bolt" tier="gold" size={44} />
              <div>
                <div style={{ fontWeight: 700 }}>Kept forever</div>
                <p style={{ fontSize: 13 }}>Every tier you reach is locked in permanently.</p>
              </div>
            </div>
            <div style={{ height: 1, background: "var(--border-faint)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  flex: "none",
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid rgba(226,96,60,.4)",
                  background: "rgba(226,96,60,.1)",
                  color: "var(--warn)",
                  fontWeight: 800,
                }}
              >
                −2
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--warn)" }}>Earned back, not given</div>
                <p style={{ fontSize: 13 }}>Skip the work and the attribute drifts down.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- final cta ---------------- */}
      <section className="lp-wrap" style={{ paddingBottom: 20 }}>
        <div className="lp-final">
          <div className="lp-final-bg" style={{ backgroundImage: `url(${burst})` }} />
          <span className="label-mono">FIND OUT WHERE YOU STAND</span>
          <h2 className="lp-h2" style={{ maxWidth: "16ch", margin: "14px auto 16px" }}>
            What's your Overall?
          </h2>
          <p className="lp-lead" style={{ maxWidth: "46ch", margin: "0 auto 30px" }}>
            Two minutes to find out. Then the only way the number moves is if you move.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/signup")}>
            Get Started
          </button>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <span>DIGNIVIRTUS</span>
          <span>BUILT FOR PEOPLE WHO WANT THE REAL NUMBER</span>
        </div>
      </footer>
    </div>
  );
}
