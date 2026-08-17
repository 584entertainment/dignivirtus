import { useRouter } from "../router.jsx";

// Required by the App Store listing and linked from the site footer.
// Written to match exactly what the app actually does — update it if data
// handling ever changes.
export default function Privacy() {
  const { navigate } = useRouter();

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 22px 60px" }}>
      <button className="back-link" onClick={() => navigate("/")}>
        ← DIGNIVIRTUS
      </button>
      <h1 style={{ fontSize: 30, fontWeight: 900, margin: "10px 0 4px" }}>Privacy Policy</h1>
      <p className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "0 0 28px" }}>
        LAST UPDATED 17 AUGUST 2026 · DIGNIVIRTUS.COM
      </p>

      <Section title="The short version">
        Dignivirtus is a fitness game. We store the minimum needed to run your account and sync your
        progress. We don't sell data, we don't run ads, and we don't share anything with third
        parties beyond the infrastructure that hosts the app.
      </Section>

      <Section title="What we collect">
        <ul style={ul}>
          <li><b style={b}>Account:</b> your email address and a password (stored hashed — we never see it).</li>
          <li><b style={b}>Profile:</b> the display name and initials you choose, and your Overall rating. These are visible to other signed-in players on the Crew leaderboard.</li>
          <li><b style={b}>Game state:</b> what you log — sets, runs, water, sleep, calories — plus the profile numbers you enter (height, weight, age, sex) used to calculate your resting metabolic rate. Stored privately against your account; no other player can read it.</li>
        </ul>
      </Section>

      <Section title="Health and location data (iPhone app)">
        <ul style={ul}>
          <li><b style={b}>Steps</b> are read from Apple Health, with your permission, to update your step badges and Endurance rating. Step counts are processed like any other log entry and synced to your private game state. We never access any other Health data.</li>
          <li><b style={b}>Location</b> is used only while you run a tracked run, to measure distance and detect sprints. Your route is processed on your phone and immediately discarded — only the resulting distance and sprint counts are saved. We never store coordinates, and location is never accessed in the background.</li>
        </ul>
        You can revoke either permission at any time in iOS Settings; the app keeps working with
        manual logging.
      </Section>

      <Section title="Where it lives">
        Your data is stored with Supabase (our database provider) and protected by row-level
        security, meaning the database itself enforces that only your account can read your game
        state. The website is hosted on GitHub Pages. Both providers process data on our behalf and
        have their own security practices; neither is given access beyond hosting.
      </Section>

      <Section title="What we don't do">
        <ul style={ul}>
          <li>No selling or sharing of personal data.</li>
          <li>No advertising, ad tracking, or third-party analytics.</li>
          <li>No reading of Health data beyond step counts.</li>
          <li>No background location tracking.</li>
        </ul>
      </Section>

      <Section title="Deleting your data">
        Email <a href="mailto:harley.hilder94@gmail.com" style={{ color: "var(--volt)" }}>harley.hilder94@gmail.com</a>{" "}
        from your account address and we'll delete your account and all associated data within 30
        days. Uninstalling the app removes all on-device data immediately.
      </Section>

      <Section title="Changes">
        If this policy changes, the date above changes with it, and material changes will be flagged
        in the app.
      </Section>
    </div>
  );
}

const ul = { margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 };
const b = { color: "var(--text-primary)" };

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>{title}</h2>
      <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}
