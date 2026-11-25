"use client";

import { X, RefreshCw, ShieldAlert } from "lucide-react";
import Card from "../ui/Card";
import InstitutionLogo from "../ui/InstitutionLogo";
import { formatBDT, typeColor } from "@/lib/chart-colors";
import type { HoldingRow } from "@/lib/finance-analytics";

export default function DrillDown({
  title,
  rows,
  onClear,
}: {
  title: string;
  rows: HoldingRow[];
  onClear: () => void;
}) {
  const sorted = [...rows].sort((a, b) => b.current - a.current);
  const total = sorted.reduce((s, r) => s + r.current, 0);
  const max = sorted[0]?.current || 1;
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          {title}
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
            {rows.length} holding{rows.length === 1 ? "" : "s"} · {formatBDT(total)}
          </span>
        </span>
      }
      subtitle="Drill-down — the holdings behind your selection"
      action={
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
        >
          <X size={12} /> Clear
        </button>
      }
    >
      <div className="divide-y divide-border">
        {sorted.map((r) => (
          <div key={r.id} className="grid items-center gap-x-4 gap-y-1 py-2.5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <InstitutionLogo name={r.item.institution} size={24} />
                <span className="truncate">
                  {r.name} <span className="text-faint">{r.ref}</span>
                </span>
                {r.item.auto_renew && (
                  <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted">
                    <RefreshCw size={9} /> renews
                  </span>
                )}
                {r.item.needs_rate_update && (
                  <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-[var(--warn)]" style={{ background: "color-mix(in srgb, var(--warn) 14%, transparent)" }}>
                    <ShieldAlert size={9} /> verify rate
                  </span>
                )}
              </div>
              <div className="text-xs text-muted">
                {r.type}
                {r.rate > 0 && ` · ${r.rate.toFixed(2)}%`}
                {r.maturity && ` · matures ${r.maturity}${r.daysLeft !== null ? ` (${r.daysLeft}d)` : ""}`}
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${(r.current / max) * 100}%`, background: typeColor(r.type) }}
              />
            </div>
            <div className="text-right text-sm font-semibold sm:min-w-[8.5rem]">
              {formatBDT(r.current)}
              <div className="text-[11px] font-normal text-muted">
                {total > 0 ? ((r.current / total) * 100).toFixed(1) : 0}% of selection
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
