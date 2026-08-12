import { useEffect, useRef, useState } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { isNativeApp } from "../lib/nativeHealth.js";
import { createRunTracker } from "../lib/runTracker.js";
import { formatDistance } from "../lib/units.js";

export default function Run({ nav }) {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const logRun = ({ totalKm, sprints50, sprints20 }) => {
    if (totalKm > 0.01) {
      dispatch({ type: "LOG_METRIC", metric: "gpsKm", amount: Math.round(totalKm * 100) / 100, attr: "END" });
    }
    for (let i = 0; i < sprints50; i++) dispatch({ type: "LOG_METRIC", metric: "sprints50m", amount: 1, attr: "SPD" });
    for (let i = 0; i < sprints20; i++) dispatch({ type: "LOG_METRIC", metric: "sprints20m", amount: 1, attr: "SPD" });
  };

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <button className="back-link" onClick={() => nav("log")}>
        ← CHOOSE
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Run</h1>
      <p className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "0 0 18px" }}>
        FEEDS LONG HAULER · SPRINT MERCHANT (50M) · FLYING START (20M)
      </p>
      {isNativeApp() ? <LiveRun units={state.units} onFinish={logRun} /> : <ManualRun units={state.units} onLog={logRun} />}
    </div>
  );
}

function LiveRun({ units, onFinish }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [snap, setSnap] = useState({ totalKm: 0, sprints50: 0, sprints20: 0, sprinting: false });
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const trackerRef = useRef(null);
  const watchRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = async () => {
    setError(null);
    setSummary(null);
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === "denied") {
        setError("Location is off for Dignivirtus. Turn it on in Settings → Privacy → Location Services.");
        return;
      }
      trackerRef.current = createRunTracker();
      watchRef.current = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000 },
        (pos) => {
          if (!pos || !trackerRef.current) return;
          trackerRef.current.addFix({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: pos.timestamp,
            accuracy: pos.coords.accuracy,
          });
          setSnap(trackerRef.current.snapshot());
        },
      );
      setSeconds(0);
      setRunning(true);
    } catch (e) {
      setError("Couldn't start GPS. Check location permissions and try again.");
    }
  };

  const stop = async () => {
    setRunning(false);
    if (watchRef.current) {
      await Geolocation.clearWatch({ id: watchRef.current });
      watchRef.current = null;
    }
    const result = trackerRef.current ? trackerRef.current.stop() : { totalKm: 0, sprints50: 0, sprints20: 0 };
    trackerRef.current = null;
    setSummary(result);
    onFinish(result);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const dist = formatDistance(snap.totalKm, units, 2);

  return (
    <>
      <div className="card" style={{ textAlign: "center", marginBottom: 16, padding: 24 }}>
        <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
          {dist.value}
          <span style={{ fontSize: 16, color: "var(--text-tertiary)", fontWeight: 600, marginLeft: 6 }}>{dist.suffix}</span>
        </div>
        <div className="mono" style={{ fontSize: 13, color: running ? "var(--volt)" : "var(--text-tertiary)", marginTop: 10 }}>
          {running ? `LIVE · ${mm}:${ss}${snap.sprinting ? " · SPRINTING" : ""}` : "READY"}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{snap.sprints50}</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--text-tertiary)" }}>50M SPRINTS</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{snap.sprints20}</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--text-tertiary)" }}>20M STARTS</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid rgba(226,96,60,.42)", background: "rgba(226,96,60,.09)" }}>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{error}</p>
        </div>
      )}

      {summary && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid var(--border-volt)", background: "rgba(200,241,53,.05)" }}>
          <div className="label-mono" style={{ marginBottom: 6 }}>RUN LOGGED</div>
          <p className="mono" style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
            {formatDistance(summary.totalKm, units, 2).value} {formatDistance(summary.totalKm, units).suffix} ·{" "}
            {summary.sprints50} × 50M · {summary.sprints20} × 20M
          </p>
        </div>
      )}

      <button
        onClick={running ? stop : start}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 999,
          border: "none",
          background: running ? "var(--warn)" : "var(--volt)",
          color: "#141906",
          fontWeight: 800,
          fontSize: 15,
        }}
      >
        {running ? "STOP & LOG RUN" : "START RUN"}
      </button>

      <p className="mono" style={{ fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
        KEEP THE APP OPEN WHILE YOU RUN. ANY MAX-EFFORT BURST OVER 20M OR 50M IS COUNTED AUTOMATICALLY.
      </p>
    </>
  );
}

function ManualRun({ units, onLog }) {
  const [km, setKm] = useState("");
  const [s50, setS50] = useState(0);
  const [s20, setS20] = useState(0);
  const [logged, setLogged] = useState(false);
  const isImperial = units === "imperial";

  const submit = () => {
    const dist = Number(km);
    const totalKm = isImperial ? dist * 1.609344 : dist;
    if (!(totalKm > 0) && !s50 && !s20) return;
    onLog({ totalKm: totalKm > 0 ? totalKm : 0, sprints50: s50, sprints20: s20 });
    setKm("");
    setS50(0);
    setS20(0);
    setLogged(true);
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label-mono" style={{ marginBottom: 8 }}>LOG A RUN</div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" }}>
          Live GPS tracking is in the iPhone app. On the web, log your distance and sprints here after a run.
        </p>
        <input
          type="number"
          step="0.1"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          placeholder={`Distance (${isImperial ? "miles" : "km"})`}
          style={{ width: "100%", boxSizing: "border-box", background: "var(--surface-2)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: 12, color: "var(--text-primary)", marginBottom: 12 }}
        />
        {[
          ["50m sprints", s50, setS50],
          ["20m starts", s20, setS20],
        ].map(([label, val, set]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span className="mono" style={{ fontSize: 12 }}>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => set(Math.max(0, val - 1))} style={stepBtn}>−</button>
              <span style={{ fontSize: 18, fontWeight: 800, minWidth: 20, textAlign: "center" }}>{val}</span>
              <button onClick={() => set(val + 1)} style={stepBtn}>+</button>
            </div>
          </div>
        ))}
      </div>
      {logged && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid var(--border-volt)", background: "rgba(200,241,53,.05)" }}>
          <p className="mono" style={{ fontSize: 12, color: "var(--good)", margin: 0 }}>RUN LOGGED ✓</p>
        </div>
      )}
      <button
        onClick={submit}
        style={{ width: "100%", padding: 16, borderRadius: 999, border: "none", background: "var(--volt)", color: "#141906", fontWeight: 800, fontSize: 15 }}
      >
        LOG IT
      </button>
    </>
  );
}

const stepBtn = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid var(--border-soft)",
  background: "var(--surface-2)",
  color: "var(--text-primary)",
  fontSize: 18,
};
