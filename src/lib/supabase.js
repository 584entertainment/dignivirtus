import { createClient } from "@supabase/supabase-js";

// The publishable key is *designed* to ship in browser code — it identifies the
// project, it does not grant access. All real protection comes from the Row Level
// Security policies on `profiles` and `player_state`, which restrict every row to
// its owner. Never put the service_role/secret key in here.
const SUPABASE_URL = "https://uhxpmaoucqrailrwxtcw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_QcRKgRMMbbGojcI_2jjZhQ_6a7u1OFe";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
