import { supabase } from "../lib/supabase.js";
import { stripTransient } from "./persistence.js";

/** Fetch this user's saved game state. Returns null when they have no row yet. */
export async function fetchRemoteState(userId) {
  const { data, error } = await supabase
    .from("player_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.state && Object.keys(data.state).length ? data.state : null;
}

/** Write the whole game state blob. RLS guarantees this can only ever be our own row. */
export async function pushRemoteState(userId, state) {
  const payload = stripTransient(state);
  const { error } = await supabase
    .from("player_state")
    .upsert(
      { user_id: userId, state: payload, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

/**
 * Mirror just the leaderboard-safe bits into `profiles`. This is the only place
 * anything about a user becomes visible to other users, so it is deliberately
 * limited to a display name, initials and the Overall number.
 */
export async function pushProfileSummary(userId, { displayName, initials, overall }) {
  const patch = { updated_at: new Date().toISOString() };
  if (typeof overall === "number") patch.overall = overall;
  if (displayName) patch.display_name = displayName;
  if (initials) patch.avatar_initials = initials;

  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

/** Everyone, best first — the real Crew board. */
export async function fetchLeaderboard(limit = 25) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_initials, overall, updated_at")
    .order("overall", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function fetchMyProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_initials, overall")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
