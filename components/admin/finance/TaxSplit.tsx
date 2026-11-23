"use client";

import { useState } from "react";
import Card from "../ui/Card";
import { formatBDT } from "@/lib/chart-colors";
import { windowTotals, type InterestEvent } from "@/lib/finance-calc";

export default function TaxSplit({
  events,
  today,
}: {
  events: InterestEvent[];
  today: string;
}) {
  const [hover, setHover] = useState<"net" | "tax" | null>(null);
  const t = windowTotals(events, today, 365).total;
  const netPct = t.gross > 0 ? (t.net / t.gross) * 100 : 0;
  const taxPct = t.gross > 0 ? (t.tax / t.gross) * 100 : 0;
  const segs = [
    { key: "net" as const, label: "You keep", value: t.net, pct: netPct, color: "var(--accent)" },
    { key: "tax" as const, label: "Source tax", value: t.tax, pct: taxPct, color: "var(--surface-3)" },
  ];
  return (
    <Card title="Where the interest goes" subtitle="Next 12 months, gross → net" delay={3}>
      <div className="text-3xl font-semibold tracking-tight">{formatBDT(t.gross)}</div>
      <div className="text-xs text-muted">gross interest expected</div>
      <div className="mt-5 flex h-4 gap-[2px] overflow-hidden rounded-full">
        {segs.map((s) => (
          <button
            key={s.key}
            aria-label={`${s.label}: ${formatBDT(s.value)}`}
            onMouseEnter={() => setHover(s.key)}
            onMouseLeave={() => setHover(null)}
            className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${s.pct}%`,
              background: s.color,
              opacity: hover && hover !== s.key ? 0.45 : 1,
              border: s.key === "tax" ? "1px solid var(--border-strong)" : undefined,
            }}
          />
        ))}
      </div>
      <div className="mt-4 space-y-2 text-sm">
        {segs.map((s) => (
          <div
            key={s.key}
            onMouseEnter={() => setHover(s.key)}
            onMouseLeave={() => setHover(null)}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2/70"
          >
            <span className="flex items-center gap-2 text-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, border: s.key === "tax" ? "1px solid var(--border-strong)" : undefined }} />
              {s.label}
            </span>
            <span className="font-semibold">
              {formatBDT(s.value)} <span className="font-normal text-muted">· {s.pct.toFixed(1)}%</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
