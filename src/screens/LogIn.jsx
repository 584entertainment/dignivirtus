import { useState } from "react";
import { useRouter } from "../router.jsx";
import { useAuth } from "../lib/auth.jsx";
import appIcon from "../assets/generated/app-icon.svg";

export default function LogIn() {
  const { navigate } = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn({ email, password });
      navigate("/app");
    } catch (err) {
      const msg = err?.message || "";
      setError(
        /confirm/i.test(msg)
          ? "That email hasn't been confirmed yet. Check your inbox for the link."
          : /invalid/i.test(msg)
            ? "That email and password don't match an account."
            : msg || "Could not log in. Please try again.",
      );
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
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 6px" }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 22px" }}>
            Pick up where your rating left off.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="li-email">Email</label>
              <input
                id="li-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="li-password">Password</label>
              <input
                id="li-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={busy}
              style={{ width: "100%", marginTop: 8, opacity: busy ? 0.6 : 1 }}
            >
              {busy ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 18, textAlign: "center" }}>
            New here?{" "}
            <button
              onClick={() => navigate("/signup")}
              style={{ background: "none", border: "none", color: "var(--volt)", fontWeight: 700, padding: 0 }}
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
