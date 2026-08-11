import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/landing.css";
import App from "./App.jsx";
import { AppProvider } from "./engine/store.jsx";
import { AuthProvider } from "./lib/auth.jsx";
import { RouterProvider } from "./router.jsx";

// Apple Health bridge: a Shortcuts automation opens dignivirtus.com/app?steps=NNNN
// with the day's Health step count. Stash it before render (login redirects would
// otherwise drop the query string) — GameApp consumes it once the player is loaded.
const params = new URLSearchParams(window.location.search);
if (params.has("steps")) {
  sessionStorage.setItem("dv.pendingSteps", params.get("steps"));
  params.delete("steps");
  const rest = params.toString();
  window.history.replaceState({}, "", window.location.pathname + (rest ? `?${rest}` : ""));
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </RouterProvider>
  </StrictMode>,
);
