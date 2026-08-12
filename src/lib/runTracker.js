// Pure run-tracking maths — no Capacitor imports so it's unit-testable in node.
// Feed it GPS fixes ({lat, lng, timestamp(ms), accuracy(m)}); it accumulates
// distance and detects max-effort sprint segments by speed threshold.

const MAX_ACCURACY_M = 25; // ignore fixes vaguer than this
const SPRINT_OPEN_MS = 5.5; // m/s (~20 km/h) — sprinting for almost everyone
const SPRINT_CLOSE_MS = 4.5; // hysteresis: drop below this to end the segment
const SPRINT_CLOSE_HOLD_S = 2; // ...for at least this long
const SPRINT_COOLDOWN_S = 15; // max one sprint counted per 15s

export function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function createRunTracker() {
  let last = null;
  let totalMeters = 0;
  let speeds = []; // last 3 raw speeds for median smoothing
  let sprint = null; // { meters, belowSince } while a segment is open
  let lastSprintEndAt = -Infinity;
  const counts = { sprints50: 0, sprints20: 0 };

  const median3 = () => {
    const s = [...speeds].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };

  const closeSprint = (tSec) => {
    if (!sprint) return;
    if (tSec - lastSprintEndAt >= SPRINT_COOLDOWN_S) {
      if (sprint.meters >= 50) counts.sprints50 += 1;
      else if (sprint.meters >= 20) counts.sprints20 += 1;
      lastSprintEndAt = tSec;
    }
    sprint = null;
  };

  return {
    addFix(fix) {
      if (fix.accuracy != null && fix.accuracy > MAX_ACCURACY_M) return;
      if (!last) {
        last = fix;
        return;
      }
      const dt = (fix.timestamp - last.timestamp) / 1000;
      if (dt <= 0) return;
      const meters = haversineMeters(last, fix);
      totalMeters += meters;

      const rawSpeed = meters / dt;
      speeds.push(rawSpeed);
      if (speeds.length > 3) speeds.shift();
      const speed = median3();
      const tSec = fix.timestamp / 1000;

      if (!sprint) {
        if (speed >= SPRINT_OPEN_MS) sprint = { meters, belowSince: null };
      } else {
        sprint.meters += meters;
        if (speed < SPRINT_CLOSE_MS) {
          if (sprint.belowSince == null) sprint.belowSince = tSec;
          else if (tSec - sprint.belowSince >= SPRINT_CLOSE_HOLD_S) closeSprint(tSec);
        } else {
          sprint.belowSince = null;
        }
      }
      last = fix;
    },

    stop() {
      // An in-flight sprint when the run ends still counts.
      if (sprint) closeSprint(last ? last.timestamp / 1000 : 0);
      return {
        totalKm: totalMeters / 1000,
        sprints50: counts.sprints50,
        sprints20: counts.sprints20,
      };
    },

    snapshot() {
      return {
        totalKm: totalMeters / 1000,
        sprints50: counts.sprints50,
        sprints20: counts.sprints20,
        sprinting: !!sprint,
      };
    },
  };
}
