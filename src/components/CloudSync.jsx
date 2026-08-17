import { useEffect, useRef, useState } from "react";
import { useAppState, useAppDispatch } from "../engine/store.jsx";
import { useAuth } from "../lib/auth.jsx";
import { fetchRemoteState, pushRemoteState, pushProfileSummary, fetchMyProfile } from "../engine/sync.js";
import { LEGACY_KEY, userKey, readState, writeState, removeState, stripTransient } from "../engine/persistence.js";
import { computeOverall } from "../engine/overall.js";

const SAVE_DEBOUNCE_MS = 1500;

function initialsFrom(name) {
  const letters = (name || "").replace(/[^a-zA-Z ]/g, "").trim().split(/\s+/);
  if (!letters[0]) return "PL";
  const a = letters[0][0] || "P";
  const b = letters[1]?.[0] || letters[0][1] || "L";
  return (a + b).toUpperCase();
}

/**
 * Bridges the local game reducer and Supabase.
 *  - on sign-in: pull the cloud copy (falling back to the offline cache, then to a
 *    one-time migration of the pre-accounts save) and hydrate the reducer
 *  - while playing: debounce-save state to the cloud and mirror Overall to `profiles`
 *  - on sign-out: wipe in-memory state so nothing leaks to the next account
 */
export default function CloudSync({ onReady }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const [hydratedFor, setHydratedFor] = useState(null);
  const saveTimer = useRef(null);
  const lastSaved = useRef("");

  // ---- hydrate on sign-in / clear on sign-out ----
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setHydratedFor(null);
      dispatch({ type: "RESET" });
      return;
    }
    if (hydratedFor === user.id) return;

    (async () => {
      let incoming = null;
      let profile = null;

      try {
        [incoming, profile] = await Promise.all([
          fetchRemoteState(user.id),
          fetchMyProfile(user.id).catch(() => null),
        ]);
        // A null right after login can be a token-timing hiccup rather than a
        // genuinely new player (RLS returns zero rows to a not-yet-authed
        // client instead of erroring). One retry costs a second and protects
        // a returning player's save.
        if (!incoming) {
          await new Promise((r) => setTimeout(r, 1000));
          incoming = await fetchRemoteState(user.id);
        }
      } catch {
        // Offline or the project is asleep — fall through to the local cache so
        // the app still opens with the last known state.
      }

      if (!incoming) incoming = readState(userKey(user.id));

      // One-time carry-over of the save made before accounts existed.
      if (!incoming) {
        const legacy = readState(LEGACY_KEY);
        if (legacy?.onboarded) {
          incoming = legacy;
          removeState(LEGACY_KEY);
        }
      }

      if (cancelled) return;

      const name = profile?.display_name || incoming?.name || user.email?.split("@")[0] || "Player";
      dispatch({
        type: "HYDRATE",
        state: {
          ...(incoming || {}),
          name,
          avatarInitials: profile?.avatar_initials || initialsFrom(name),
        },
      });

      setHydratedFor(user.id);
      onReady?.();
    })();

    return () => {
      cancelled = true;
    };
  }, [user, hydratedFor, dispatch, onReady]);

  // ---- debounced save ----
  useEffect(() => {
    if (!user || hydratedFor !== user.id) return;
    // Never sync a pre-onboarding state to the cloud. A brand-new player has
    // nothing worth saving yet, and — critically — a returning player who was
    // wrongly hydrated with defaults (failed fetch) must not have that blank
    // state overwrite their real save.
    if (!state.onboarded) return;

    const snapshot = JSON.stringify(stripTransient(state));
    if (snapshot === lastSaved.current) return;

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      lastSaved.current = snapshot;
      writeState(userKey(user.id), stripTransient(state));

      try {
        await pushRemoteState(user.id, state);
        if (state.onboarded) {
          const { overall } = computeOverall(state);
          await pushProfileSummary(user.id, {
            displayName: state.name,
            initials: state.avatarInitials,
            overall,
          });
        }
      } catch {
        // Keep the local cache and retry on the next change rather than
        // interrupting a workout with an error dialog.
        lastSaved.current = "";
      }
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimer.current);
  }, [state, user, hydratedFor]);

  return null;
}

export function useIsHydrating() {
  const { user, loading } = useAuth();
  return loading || !user;
}
