import { createBrowserClient } from "@supabase/ssr";

// Returns null if Supabase env vars aren't configured yet, so the app can
// still render (in read-only, seed-data mode) before the backend is wired up.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
