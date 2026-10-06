"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BadgeCheck, Loader2 } from "lucide-react";
import { formatBDT } from "@/lib/chart-colors";
import { instrumentLabel } from "@/lib/finance-calc";
import type { FinancialInstrument } from "@/lib/types";

export default function RateQueue({
  items,
  supabase,
  onPatch,
}: {
  items: FinancialInstrument[];
  supabase: SupabaseClient;
  onPatch: (id: string, patch: Partial<FinancialInstrument>) => void;
}) {
  const queue = items.filter((i) => i.needs_rate_update);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (queue.length === 0) return null;

  async function confirm(i: FinancialInstrument) {
    const raw = drafts[i.id] ?? String(i.interest_rate);
    const rate = Number(raw);
    if (!Number.isFinite(rate) || rate < 0) {
      setError("Enter a valid rate.");
      return;
    }
    setBusy(i.id);
    setError(null);
    const patch = { interest_rate: rate, needs_rate_update: false };
    const { error: err } = await supabase
      .from("financial_instruments")
      .update(patch)
      .eq("id", i.id);
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    onPatch(i.id, patch);
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
      <div className="mb-1 text-sm font-medium">
        Rate check queue · {queue.length}
      </div>
      <p className="mb-3 text-xs text-muted">
        These FDRs renewed automatically. Check the new rate on the bank portal,
        correct it if it changed, then confirm.
      </p>
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <div className="space-y-2">
        {queue.map((i) => (
          <div
            key={i.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {instrumentLabel(i)}
              </div>
              <div className="text-xs text-muted">
                {formatBDT(Number(i.principal_amount))} · renewed{" "}
                {i.last_renewed_at ?? "—"} · now matures {i.maturity_date}
                {i.renewal_count > 0 && ` · renewal #${i.renewal_count}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.05"
                value={drafts[i.id] ?? String(i.interest_rate)}
                onChange={(e) =>
                  setDrafts((d) => ({ ...d, [i.id]: e.target.value }))
                }
                className="w-20 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
                aria-label="Confirmed rate (%/yr)"
              />
              <span className="text-xs text-muted">%/yr</span>
              <button
                onClick={() => confirm(i)}
                disabled={busy === i.id}
                className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
              >
                {busy === i.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <BadgeCheck size={12} />
                )}
                Confirm
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
