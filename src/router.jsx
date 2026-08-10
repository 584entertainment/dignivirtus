import { createContext, useContext, useEffect, useState } from "react";

// A deliberately tiny router. GitHub Pages has no server, so `dist/404.html` is a
// copy of `index.html` — GitHub serves it for any unknown path, the app boots, and
// this reads the real path back off `window.location`. That gives clean URLs
// (/signup, /app) on a purely static host.

const RouterContext = createContext(null);

function normalise(pathname) {
  const p = (pathname || "/").replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => normalise(window.location.pathname));

  useEffect(() => {
    const onPop = () => setPath(normalise(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to, { replace = false } = {}) => {
    if (replace) window.history.replaceState({}, "", to);
    else window.history.pushState({}, "", to);
    setPath(normalise(to));
    window.scrollTo(0, 0);
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used inside RouterProvider");
  return ctx;
}
