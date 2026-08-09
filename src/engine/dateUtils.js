// Local calendar date as "YYYY-MM-DD" — deliberately NOT toISOString(), which converts
// to UTC and silently shifts the date by a day for anyone outside UTC+0 (e.g. Sydney).
export function dayKey(d = new Date()) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthKey(d = new Date()) {
  return dayKey(d).slice(0, 7);
}

// ISO week key, e.g. "2026-W32" — used so "this week" resets on the same day for everyone.
export function weekKey(d = new Date()) {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((dt - yearStart) / 86400000 + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function daysAgo(isoDate) {
  const then = new Date(isoDate + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((now - then) / 86400000);
}

export function todayKey() {
  return dayKey(new Date());
}

export function addDaysKey(key, n) {
  const dt = new Date(key + "T00:00:00");
  dt.setDate(dt.getDate() + n);
  return dayKey(dt);
}
