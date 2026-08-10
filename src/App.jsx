import { useEffect } from "react";
import { useRouter } from "./router.jsx";
import { useAuth } from "./lib/auth.jsx";
import Landing from "./screens/Landing.jsx";
import SignUp from "./screens/SignUp.jsx";
import LogIn from "./screens/LogIn.jsx";
import GameApp from "./GameApp.jsx";

function Redirect({ to }) {
  const { navigate } = useRouter();
  useEffect(() => {
    navigate(to, { replace: true });
  }, [navigate, to]);
  return null;
}

export default function App() {
  const { path } = useRouter();
  const { session, loading } = useAuth();

  // Avoid deciding anything until we know whether there's a session — otherwise a
  // signed-in user hitting /app directly gets bounced to the login screen for a
  // frame before being sent back.
  if (loading) return null;

  switch (path) {
    case "/":
      return <Landing />;

    case "/signup":
      return session ? <Redirect to="/app" /> : <SignUp />;

    case "/login":
      return session ? <Redirect to="/app" /> : <LogIn />;

    case "/app":
      return session ? <GameApp /> : <Redirect to="/login" />;

    default:
      // Unknown path (GitHub Pages served 404.html) — send them somewhere real.
      return <Redirect to="/" />;
  }
}
