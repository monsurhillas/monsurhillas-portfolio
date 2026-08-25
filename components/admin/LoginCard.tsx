"use client";

import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/icons";

export default function LoginCard({ error }: { error?: string }) {
  const supabase = createClient();

  async function handleLogin() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Admin sign-in</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in with the Google account that owns this site to edit its
        content.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {error === "not-allowed"
            ? "That Google account isn't authorized to edit this site."
            : "Something went wrong signing you in. Please try again."}
        </p>
      )}

      {supabase ? (
        <button
          onClick={handleLogin}
          className="mt-8 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
        >
          <GoogleIcon width={16} height={16} /> Continue with Google
        </button>
      ) : (
        <p className="mt-8 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          Supabase isn&rsquo;t configured yet in this deployment. Add the
          Supabase environment variables to enable sign-in.
        </p>
      )}
    </div>
  );
}
