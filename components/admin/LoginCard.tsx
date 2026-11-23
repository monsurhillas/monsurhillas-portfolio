"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/icons";

function LoginError() {
  // Layouts can't receive searchParams (they don't re-render on navigation),
  // so the auth-callback error is read here client-side instead of being
  // passed down as a prop from a server component.
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  return (
    <p className="mt-4 rounded-lg border px-4 py-2 text-sm" style={{ color: "var(--bad)", borderColor: "color-mix(in srgb, var(--bad) 40%, transparent)", background: "color-mix(in srgb, var(--bad) 10%, transparent)" }}>
      {error === "not-allowed"
        ? "That Google account isn't authorized to edit this site."
        : "Something went wrong signing you in. Please try again."}
    </p>
  );
}

export default function LoginCard() {
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
     <div className="card hero reveal w-full px-8 py-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-lg font-semibold text-white">M</div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Admin sign-in</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in with the Google account that owns this site to edit its
        content.
      </p>

      <Suspense fallback={null}>
        <LoginError />
      </Suspense>

      {supabase ? (
        <button
          onClick={handleLogin}
          className="mx-auto mt-8 flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
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
    </div>
  );
}
