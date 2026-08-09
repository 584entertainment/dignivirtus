import { useAppState, useAppDispatch } from "./engine/store.jsx";
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

const TAB_SCREENS = new Set(["player", "badges", "log", "crew"]);

export default function App() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  if (!state.onboarded) {
    return <BaselineSurvey />;
  }

  const nav = (screen, badgeId) => dispatch({ type: "NAV", screen, badgeId });

  let screenView;
  switch (state.screen) {
    case "player":
      screenView = <Player nav={nav} />;
      break;
    case "badges":
      screenView = <Badges nav={nav} />;
      break;
    case "detail":
      screenView = <BadgeDetail nav={nav} />;
      break;
    case "log":
      screenView = <LiveLog nav={nav} />;
      break;
    case "rings":
      screenView = <Movement nav={nav} />;
      break;
    case "quick":
      screenView = <Recovery nav={nav} />;
      break;
    case "crew":
      screenView = <Crew nav={nav} />;
      break;
    case "profile":
      screenView = <Profile nav={nav} />;
      break;
    default:
      screenView = <Player nav={nav} />;
  }

  const pendingUnlock = state.unlockQueue[0];

  return (
    <div className="app-shell">
      {screenView}
      {TAB_SCREENS.has(state.screen) && <TabBar active={state.screen} onNav={nav} />}
      {pendingUnlock && <Unlock unlock={pendingUnlock} nav={nav} />}
    </div>
  );
}
