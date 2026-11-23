"use client";

import { useCallback, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { JOB_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import { createClient } from "@/lib/supabase/client";
import type { JobListing } from "@/lib/types";

const STATUSES = [
  { name: "Interested", color: "var(--muted)" },
  { name: "Applied", color: "var(--series-1)" },
  { name: "Interview", color: "var(--warn)" },
  { name: "Offer", color: "var(--good)" },
  { name: "Rejected", color: "var(--bad)" },
];

export default function JobsSection({
  initialItems,
}: {
  initialItems: JobListing[];
}) {
  const supabase = createClient();
  const [items, setItems] = useState<JobListing[]>(initialItems);
  const [status, setStatus] = useState<string | null>(null);
  const onChange = useCallback(
    (rows: Record<string, unknown>[]) => setItems(rows as unknown as JobListing[]),
    []
  );

  const byStatus = useMemo(
    () =>
      items.reduce<Record<string, number>>((acc, j) => {
        acc[j.status] = (acc[j.status] ?? 0) + 1;
        return acc;
      }, {}),
    [items]
  );
  const autoFetched = items.filter((j) => j.source === "jsearch").length;
  const filter = useCallback(
    (row: Record<string, unknown>) => !status || row.status === status,
    [status]
  );

  if (!supabase) {
    return <p className="text-sm text-[var(--bad)]">Supabase isn&rsquo;t configured in this deployment.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUSES.map((s, i) => {
          const active = status === s.name;
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => setStatus(active ? null : s.name)}
              aria-pressed={active}
              className="card card-interactive reveal px-4 py-3 text-left"
              style={{
                animationDelay: `${i * 50}ms`,
                outline: active ? `2px solid ${s.color}` : undefined,
                outlineOffset: -2,
              }}
            >
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.name}
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{byStatus[s.name] ?? 0}</div>
            </button>
          );
        })}
        <div className="card reveal px-4 py-3" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center gap-2 text-xs text-muted">
            <Zap size={12} className="text-accent" />
            Auto-fetched
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{autoFetched}</div>
        </div>
      </div>

      <p className="text-xs text-muted">
        Click a status to filter the list. New Dhaka bank/data/product listings are fetched automatically once a day.
        Use &ldquo;Add job&rdquo; to paste in a link you found yourself (e.g. LinkedIn or bdjobs) — the automated fetch has
        limited Bangladesh coverage, so this is the reliable way to make sure a listing you care about ends up here.
      </p>

      <GenericEditor
        config={JOB_CONFIG}
        initialItems={initialItems as unknown as Record<string, unknown>[]}
        supabase={supabase}
        onItemsChange={onChange}
        filter={filter}
      />
    </div>
  );
}
