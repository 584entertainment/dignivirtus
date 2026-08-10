import { useState } from "react";
import { useRouter } from "../router.jsx";
import { useAuth } from "../lib/auth.jsx";
import appIcon from "../assets/generated/app-icon.svg";

export default function SignUp() {
  const { navigate } = useRouter();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password needs to be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const { needsConfirmation } = await signUp({ email, password, displayName });
      if (needsConfirmation) {
        // Project still has email confirmation switched on — say so honestly
        // rather than bouncing them to a screen they aren't signed in for.
        setConfirmSent(true);
      } else {
        navigate("/app");
      }
    } catch (err) {
      setError(err?.message || "Could not create the account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="lp">
      <div className="lp-grain" />
      <div className="auth-shell">
        <button
          className="lp-brand"
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", marginBottom: 26 }}
        >
          <img src={appIcon} alt="" />
          Dignivirtus
        </button>

        <div className="auth-card">
          {confirmSent ? (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 10px" }}>Check your email</h1>
              <div className="auth-info">
                We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and log
                in.
              </div>
              <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => navigate("/login")}>
                Go to log in
              </button>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 6px" }}>Create your account</h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 22px", lineHeight: 1.55 }}>
                Then we'll rate you.
              </p>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={submit}>
                <div className="field">
                  <label htmlFor="su-name">Name</label>
                  <input
                    id="su-name"
                    type="text"
                    autoComplete="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jordan Diaz"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="su-email">Email</label>
                  <input
                    id="su-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="su-password">Password</label>
                  <input
                    id="su-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />
                </div>

                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={busy}
                  style={{ width: "100%", marginTop: 8, opacity: busy ? 0.6 : 1 }}
                >
                  {busy ? "Creating…" : "Create account"}
                </button>
              </form>

              <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 18, textAlign: "center" }}>
                Already have one?{" "}
                <button
                  onClick={() => navigate("/login")}
                  style={{ background: "none", border: "none", color: "var(--volt)", fontWeight: 700, padding: 0 }}
                >
                  Log in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
