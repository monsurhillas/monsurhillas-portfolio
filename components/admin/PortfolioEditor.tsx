"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TABLE_CONFIGS } from "@/lib/admin-fields";
import ProfileEditor from "./ProfileEditor";
import GenericEditor from "./GenericEditor";
import type { SiteContent } from "@/lib/types";

// The tabbed profile/experience/education/... editor that used to be the
// entire admin dashboard. Now it's just the content of the "Portfolio
// Update" sidebar section — the sign-out/view-site chrome moved to
// AdminShell, which wraps every section.
export default function PortfolioEditor({
  content,
}: {
  content: SiteContent;
}) {
  const [tab, setTab] = useState("profile");
  const supabase = createClient();

  if (!supabase) {
    return (
      <p className="text-sm text-red-500">
        Supabase isn&rsquo;t configured in this deployment.
      </p>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile" },
    ...TABLE_CONFIGS.map((c) => ({ id: c.table, label: c.title })),
  ];

  return (
    <div>
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
