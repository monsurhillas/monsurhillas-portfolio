"use client";

import { JOB_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import { createClient } from "@/lib/supabase/client";
import type { JobListing } from "@/lib/types";

export default function JobsSection({
  initialItems,
}: {
  initialItems: JobListing[];
}) {
  const supabase = createClient();
  if (!supabase) {
    return (
      <p className="text-sm text-red-500">
        Supabase isn&rsquo;t configured in this deployment.
      </p>
    );
  }

  const byStatus = initialItems.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1;
    return acc;
  }, {});
  const autoFetched = initialItems.filter((j) => j.source === "jsearch").length;

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {["Interested", "Applied", "Interview", "Offer", "Rejected"].map(
          (s) => (
            <div
              key={s}
              className="rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="text-xl font-semibold">{byStatus[s] ?? 0}</div>
              <div className="text-xs text-muted">{s}</div>
            </div>
          )
        )}
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <div className="text-xl font-semibold">{autoFetched}</div>
          <div className="text-xs text-muted">Auto-fetched</div>
        </div>
      </div>

      <p className="mb-4 text-xs text-muted">
        New Dhaka bank/data/product listings are fetched automatically once a
        day. Use &ldquo;Add job&rdquo; below to paste in a link you found
        yourself (e.g. from LinkedIn or bdjobs) — the automated fetch has
        limited Bangladesh coverage, so this is the reliable way to make sure
        a listing you care about ends up here.
      </p>

      <GenericEditor
        config={JOB_CONFIG}
        initialItems={initialItems as unknown as Record<string, unknown>[]}
        supabase={supabase}
      />
    </div>
  );
}
