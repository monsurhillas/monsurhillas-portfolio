"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert } from "lucide-react";
import { ADMIN_EMAIL } from "@/lib/admin";

export default function NotAuthorized({ email }: { email: string }) {
  const supabase = createClient();
  const router = useRouter();

  async function handleSignOut() {
    await supabase?.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
     <div className="card reveal w-full px-8 py-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ color: "var(--bad)", background: "color-mix(in srgb, var(--bad) 14%, transparent)" }}>
        <ShieldAlert size={22} />
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Not authorized
      </h1>
      <p className="mt-2 text-sm text-muted">
        You&rsquo;re signed in as <strong>{email}</strong>, but only{" "}
        <strong>{ADMIN_EMAIL}</strong> can edit this site.
      </p>
      <button
        onClick={handleSignOut}
        className="mt-8 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
      >
        Sign out
      </button>
     </div>
    </div>
  );
}
