"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TABLE_CONFIGS } from "@/lib/admin-fields";
import ProfileEditor from "./ProfileEditor";
import GenericEditor from "./GenericEditor";
import type { SiteContent } from "@/lib/types";

export default function AdminDashboard({
  content,
  userEmail,
}: {
  content: SiteContent;
  userEmail: string;
}) {
  const [tab, setTab] = useState("profile");
  const supabase = createClient();
  const router = useRouter();

  if (!supabase) {
    return (
      <p className="text-sm text-red-500">
        Supabase isn&rsquo;t configured in this deployment.
      </p>
    );
  }

  async function handleSignOut() {
    await supabase!.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

  const tabs = [
    { id: "profile", label: "Profile" },
    ...TABLE_CONFIGS.map((c) => ({ id: c.table, label: c.title })),
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Content admin
          </h1>
          <p className="text-sm text-muted">Signed in as {userEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm"
          >
            View site <ExternalLink size={14} />
          </a>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-red-500"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-1 border-b border-border pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-accent text-white"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <ProfileEditor initial={content.profile} supabase={supabase} />
      )}

      {TABLE_CONFIGS.map(
        (c) =>
          tab === c.table && (
            <GenericEditor
              key={c.table}
              config={c}
              initialItems={
                (content[
                  c.table as keyof SiteContent
                ] as unknown as Record<string, unknown>[]) ?? []
              }
              supabase={supabase}
            />
          )
      )}
    </div>
  );
}
