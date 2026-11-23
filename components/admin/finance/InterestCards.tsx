"use client";

import { CalendarClock } from "lucide-react";
import { formatBDT } from "@/lib/chart-colors";
import { useCountUp } from "@/lib/use-count-up";
import { windowTotals, type InterestEvent } from "@/lib/finance-calc";

const WINDOWS = [
  { days: 7, label: "Next 7 days" },
  { days: 30, label: "Next 30 days" },
  { days: 90, label: "Next 90 days" },
];

function Card({
  label,
  totals,
  delay,
}: {
  label: string;
  totals: ReturnType<typeof windowTotals>;
  delay: number;
}) {
  const animated = useCountUp(totals.total.net);
  const parts = [
    { name: "FDR", color: "var(--series-1)", ...totals.fdr },
    { name: "Sanchaypatra", color: "var(--series-2)", ...totals.sanchaypatra },
  ];
  const sum = totals.total.net || 1;
  return (
    <div
      className="card card-interactive reveal p-5"
      style={{ animationDelay: `${delay * 60}ms` }}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <CalendarClock size={13} className="text-accent" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">
        {formatBDT(animated)}
      </div>
      <div className="text-xs text-muted">
        net of tax · gross {formatBDT(totals.total.gross)} · tax{" "}
        {formatBDT(totals.total.tax)}
      </div>
      {/* split bar: FDR vs Sanchaypatra share of this window */}
      <div className="mt-4 flex h-1.5 gap-[2px] overflow-hidden rounded-full bg-surface-2">
        {parts.map(
          (p) =>
            p.net > 0 && (
              <span
                key={p.name}
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${(p.net / sum) * 100}%`, background: p.color }}
              />
            )
        )}
      </div>
      <div className="mt-3 space-y-1.5 text-xs">
        {parts.map((p) => (
          <div key={p.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.name}
              {p.count > 0 && (
                <span className="text-faint">
                  · {p.count} payout{p.count > 1 ? "s" : ""}
                </span>
              )}
            </span>
            <span className="font-medium">{formatBDT(p.net)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InterestCards({
  events,
  today,
}: {
  events: InterestEvent[];
  today: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {WINDOWS.map((w, i) => (
        <Card
          key={w.days}
          label={w.label}
          totals={windowTotals(events, today, w.days)}
          delay={i}
        />
      ))}
    </div>
  );
}
