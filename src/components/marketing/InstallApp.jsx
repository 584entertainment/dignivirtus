import { useEffect, useState } from "react";

// "Download the app" without an app store: Chrome/Android hand us a real install
// prompt via beforeinstallprompt; iOS never does, so Safari users get the exact
// two taps instead. Inside the installed app this renders nothing.

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

export default function InstallApp() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const click = async () => {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setPrompt(null);
    } else {
      setShowIOSHelp(true);
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
      <button className="btn btn-ghost btn-lg" onClick={click}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Get the app
      </button>
      {showIOSHelp && (
        <p className="mono" style={{ fontSize: 11, lineHeight: 1.7, color: "var(--text-secondary)", maxWidth: "34ch", margin: 0 }}>
          {isIOS()
            ? "IN SAFARI: TAP SHARE (□↑) THEN “ADD TO HOME SCREEN”. IT INSTALLS LIKE ANY APP."
            : "IN YOUR BROWSER MENU, CHOOSE “INSTALL APP” OR “ADD TO HOME SCREEN”."}
        </p>
      )}
    </div>
  );
}
