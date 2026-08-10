import { useCallback, useState } from "react";
import { useAppState, useAppDispatch } from "./engine/store.jsx";
import CloudSync from "./components/CloudSync.jsx";
import TabBar from "./components/TabBar.jsx";
import BaselineSurvey from "./screens/BaselineSurvey.jsx";
import Player from "./screens/Player.jsx";
import Badges from "./screens/Badges.jsx";
import BadgeDetail from "./screens/BadgeDetail.jsx";
import LiveLog from "./screens/LiveLog.jsx";
import Movement from "./screens/Movement.jsx";
import Recovery from "./screens/Recovery.jsx";
import Crew from "./screens/Crew.jsx";
import Profile from "./screens/Profile.jsx";
import Unlock from "./screens/Unlock.jsx";
import appIcon from "./assets/generated/app-icon.svg";

const TAB_SCREENS = new Set(["player", "badges", "log", "crew"]);

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

  const nav = (screen, badgeId) => dispatch({ type: "NAV", screen, badgeId });

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
        body = <LiveLog nav={nav} />;
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
      default:
        body = <Player nav={nav} />;
    }
  }

  const pendingUnlock = ready && state.onboarded ? state.unlockQueue[0] : null;
  const showTabs = ready && state.onboarded && TAB_SCREENS.has(state.screen);

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
      {showTabs && <TabBar active={state.screen} onNav={nav} />}
      {pendingUnlock && <Unlock unlock={pendingUnlock} nav={nav} />}
    </div>
  );
}
