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
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
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
        className="mt-8 rounded-full border border-border px-5 py-2.5 text-sm font-medium"
      >
        Sign out
      </button>
    </div>
  );
}
