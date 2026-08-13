import { useCallback, useEffect, useState } from "react";
import { useAppState, useAppDispatch } from "./engine/store.jsx";
import { App as CapApp } from "@capacitor/app";
import { isNativeApp, fetchNativeSteps } from "./lib/nativeHealth.js";
import { rescheduleReminders } from "./lib/reminders.js";
import CloudSync from "./components/CloudSync.jsx";
import TabBar from "./components/TabBar.jsx";
import BaselineSurvey from "./screens/BaselineSurvey.jsx";
import Player from "./screens/Player.jsx";
import Badges from "./screens/Badges.jsx";
import BadgeDetail from "./screens/BadgeDetail.jsx";
import LiveLog from "./screens/LiveLog.jsx";
import LogChooser from "./screens/LogChooser.jsx";
import Fuel from "./screens/Fuel.jsx";
import Run from "./screens/Run.jsx";
import Movement from "./screens/Movement.jsx";
import Recovery from "./screens/Recovery.jsx";
import Crew from "./screens/Crew.jsx";
import Profile from "./screens/Profile.jsx";
import HowItWorks from "./screens/HowItWorks.jsx";
import Unlock from "./screens/Unlock.jsx";
import TierLost from "./screens/TierLost.jsx";
import appIcon from "./assets/generated/app-icon.svg";

// Which tab lights up for each screen — sub-screens highlight their parent tab
// so the bar can stay visible everywhere without ever looking "off".
const TAB_FOR_SCREEN = {
  player: "player",
  rings: "player",
  quick: "player",
  profile: "player",
  badges: "badges",
  detail: "badges",
  log: "log",
  livelog: "log",
  fuel: "log",
  run: "player",
  how: "player",
  crew: "crew",
};

function Booting() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        gap: 18,
        textAlign: "center",
      }}
    >
      <div>
        <img src={appIcon} alt="" width={54} height={54} style={{ animation: "breatheGlow 1.6s ease-in-out infinite" }} />
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--text-tertiary)", marginTop: 14 }}>
          LOADING YOUR RATING
        </div>
      </div>
    </div>
  );
}

export default function GameApp() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  // Held back until the cloud copy lands, so a returning player never sees a
  // flash of the baseline survey they already completed.
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  const nav = (screen, badgeId, part) => dispatch({ type: "NAV", screen, badgeId, part });

  // Consume a step count delivered by the Apple Health shortcut (?steps=NNNN),
  // once the player's real state has loaded so it can't be lost to hydration.
  useEffect(() => {
    if (!ready || !state.onboarded) return;
    const raw = sessionStorage.getItem("dv.pendingSteps");
    if (raw == null) return;
    sessionStorage.removeItem("dv.pendingSteps");
    const n = Math.round(Number(raw));
    if (Number.isFinite(n) && n > 0 && n < 200000) {
      dispatch({ type: "SET_METRIC_TODAY", metric: "steps", amount: n, attr: "END" });
    }
  }, [ready, state.onboarded, dispatch]);

  // Native app: pull today's steps from HealthKit on launch and every time the
  // app comes back to the foreground. Fully automatic — no typing, no shortcut.
  useEffect(() => {
    if (!ready || !state.onboarded || !isNativeApp()) return;

    let cancelled = false;
    const sync = async () => {
      const steps = await fetchNativeSteps();
      if (!cancelled && steps != null && steps > 0) {
        dispatch({ type: "SET_METRIC_TODAY", metric: "steps", amount: steps, attr: "END" });
      }
    };

    sync();
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ready, state.onboarded, dispatch]);

  // Native: keep the midday/evening reminder notifications in sync with today's
  // progress — refreshed on launch and every time the app is backgrounded.
  useEffect(() => {
    if (!ready || !state.onboarded || !isNativeApp()) return;
    rescheduleReminders(state);
    const sub = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) rescheduleReminders(state);
    });
    return () => {
      sub.then((s) => s.remove());
    };
  }, [ready, state.onboarded, state.logs, state.dailyTargets]);

  let body;
  if (!ready) {
    body = <Booting />;
  } else if (!state.onboarded) {
    body = <BaselineSurvey />;
  } else {
    switch (state.screen) {
      case "badges":
        body = <Badges nav={nav} />;
        break;
      case "detail":
        body = <BadgeDetail nav={nav} />;
        break;
      case "log":
        body = <LogChooser nav={nav} />;
        break;
      case "livelog":
        body = <LiveLog nav={nav} />;
        break;
      case "fuel":
        body = <Fuel nav={nav} />;
        break;
      case "run":
        body = <Run nav={nav} />;
        break;
      case "rings":
        body = <Movement nav={nav} />;
        break;
      case "quick":
        body = <Recovery nav={nav} />;
        break;
      case "crew":
        body = <Crew nav={nav} />;
        break;
      case "profile":
        body = <Profile nav={nav} />;
        break;
      case "how":
        body = <HowItWorks nav={nav} />;
        break;
      default:
        body = <Player nav={nav} />;
    }
  }

  const pendingUnlock = ready && state.onboarded ? state.unlockQueue[0] : null;
  // A win outranks a loss: never show a demotion on top of a celebration.
  const pendingLoss = ready && state.onboarded && !pendingUnlock ? (state.lostQueue || [])[0] : null;
  const showTabs = ready && state.onboarded;

  // Keyed by screen so the enter animation replays on every navigation.
  const keyedBody = (
    <div className="screen-anim" key={ready ? state.screen : "boot"}>
      {body}
    </div>
  );

  return (
    <div className="app-shell">
      <CloudSync onReady={onReady} />
      {keyedBody}
      {showTabs && <TabBar active={TAB_FOR_SCREEN[state.screen] || "player"} onNav={nav} />}
      {pendingUnlock && <Unlock unlock={pendingUnlock} nav={nav} />}
      {pendingLoss && <TierLost loss={pendingLoss} nav={nav} />}
    </div>
  );
}
