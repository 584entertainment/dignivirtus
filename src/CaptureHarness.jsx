import { useEffect, useState } from "react";
import { useAppDispatch } from "./engine/store.jsx";
import TabBar from "./components/TabBar.jsx";
import Player from "./screens/Player.jsx";
import Badges from "./screens/Badges.jsx";
import Crew from "./screens/Crew.jsx";
import Unlock from "./screens/Unlock.jsx";

// DEV-ONLY. Renders real app screens with seeded data and no login, purely so the
// marketing trailer can be shot against genuine UI. Guarded by import.meta.env.DEV
// in App.jsx, so it is dead code in any production build.

const today = new Date().toISOString().slice(0, 10);
const entry = (amount, dayOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  return { date: d.toISOString().slice(0, 10), amount };
};

const DEMO_STATE = {
  onboarded: true,
  name: "Jordan Diaz",
  avatarInitials: "JD",
  streak: 12,
  seasonPeak: 61,
  lastOpenDate: today,
  decayWarnings: true,
  attributeBase: { STR: 66, END: 62, MOB: 49, REC: 61, SPD: 58 },
  attributeBumps: { STR: 2, END: 2, MOB: 2, REC: 2, SPD: 0 },
  attributeWeekSnapshot: { STR: 67, END: 63, MOB: 51, REC: 61, SPD: 60 },
  lastActivity: { STR: today, END: today, MOB: today, REC: today },
  badgeTiers: {
    delt: "silver", hinge: "bronze", grip: "bronze", press: "bronze",
    tenk: "silver", haul: "bronze", zone: "gold", stairs: "locked",
    hip: "bronze", ankle: "locked", rotate: "locked", fold: "locked",
    hydro: "silver", sleep: "bronze", rest: "bronze", idle: "locked",
    sprint: "bronze", sub9: "locked", split: "locked", start: "locked",
  },
  flags: { hingePR: true },
  logs: {
    lateralDeltSets: [entry(4), entry(5, 1), entry(6, 2)],
    posteriorChainSets: [entry(6), entry(5, 2)],
    pressingSets: [entry(5), entry(4, 1)],
    hangSeconds: [entry(140), entry(120, 2)],
    steps: [entry(9420), entry(12400, 1), entry(11100, 2)],
    gpsKm: [entry(6.8), entry(9.2, 2)],
    zone2Minutes: [entry(45), entry(60, 1), entry(55, 3)],
    water: [entry(2.25), entry(3.25, 1), entry(3.25, 2)],
    sleepHours: [entry(7.8, 1), entry(7.6, 2), entry(8.1, 3)],
    hipMobilityMinutes: [entry(25)],
    sprintsOver90: [entry(1), entry(1, 2)],
    floors: [], deepSquatHolds: [], rotationMinutes: [], foldHoldSeconds: [],
    restDays: [], restingHR: [], best1kmSplit: [], negSplitRuns: [], accelerations: [],
  },
  baselines: {},
};

export default function CaptureHarness() {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const screen = params.get("screen") || "player";

  // ?t=0..1 freezes every animated widget at that exact point, so a frame sequence
  // can be shot of the real UI animating instead of faking the motion in the edit.
  if (params.has("t")) window.__CAPTURE_T = parseFloat(params.get("t"));

  useEffect(() => {
    dispatch({ type: "HYDRATE", state: DEMO_STATE });
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, [dispatch]);

  if (!ready) return null;

  const nav = () => {};

  if (screen === "unlock") {
    return (
      <div className="app-shell">
        <Unlock unlock={{ badgeId: "zone", fromTier: "silver", toTier: "gold" }} nav={nav} />
      </div>
    );
  }

  const body =
    screen === "badges" ? <Badges nav={nav} /> : screen === "crew" ? <Crew nav={nav} /> : <Player nav={nav} />;

  return (
    <div className="app-shell">
      {body}
      <TabBar active={screen === "badges" ? "badges" : screen === "crew" ? "crew" : "player"} onNav={nav} />
    </div>
  );
}
