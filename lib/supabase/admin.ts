import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client — bypasses Row Level Security entirely.
// Server-only: never import this from a Client Component or anywhere that
// ships to the browser. It exists solely for the unattended daily jobs-fetch
// cron, which runs with no signed-in user session and therefore no JWT for
// RLS's `auth.jwt() ->> 'email'` check to match against.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
