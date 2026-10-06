"use client";

import { CalendarClock } from "lucide-react";
import { formatBDT } from "@/lib/chart-colors";
import { useCountUp } from "@/lib/use-count-up";
import {
  windowTotals,
  type InterestEvent,
} from "@/lib/finance-calc";

const WINDOWS = [
  { days: 7, label: "Next 7 days" },
  { days: 30, label: "Next 30 days" },
  { days: 90, label: "Next 90 days" },
];

function Card({
  label,
  totals,
}: {
  label: string;
  totals: ReturnType<typeof windowTotals>;
}) {
  const animated = useCountUp(totals.total.net);
  const parts = [
    { name: "FDR", value: totals.fdr.net, count: totals.fdr.count },
    {
      name: "Sanchaypatra",
      value: totals.sanchaypatra.net,
      count: totals.sanchaypatra.count,
    },
  ];
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <CalendarClock size={13} />
        Interest expected · {label.toLowerCase()}
      </div>
      <div className="mt-1 text-2xl font-semibold">{formatBDT(animated)}</div>
      <div className="text-xs text-muted">
        after tax · gross {formatBDT(totals.total.gross)} · tax{" "}
        {formatBDT(totals.total.tax)}
      </div>
      <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
        {parts.map((p) => (
          <div key={p.name} className="flex justify-between">
            <span className="text-muted">
              {p.name}
              {p.count > 0 && ` · ${p.count} payout${p.count > 1 ? "s" : ""}`}
            </span>
            <span className="font-medium">{formatBDT(p.value)}</span>
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
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      {WINDOWS.map((w) => (
        <Card
          key={w.days}
          label={w.label}
          totals={windowTotals(events, today, w.days)}
        />
      ))}
    </div>
  );
}
