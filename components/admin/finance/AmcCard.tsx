"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import Card from "../ui/Card";
import PercentBar from "../PercentBar";
import { colorForIndex, formatBDT } from "@/lib/chart-colors";
import { daysBetween } from "@/lib/finance-calc";
import type { FinancialInstrument } from "@/lib/types";

export default function AmcCard({
  items,
  today,
}: {
  items: FinancialInstrument[];
  today: string;
}) {
  const rows = useMemo(() => {
    const map = new Map<string, { invested: number; current: number; updated: string }>();
    for (const i of items) {
      if (i.type !== "Mutual Fund") continue;
      const k = i.institution || "Unspecified AMC";
      const e = map.get(k) ?? { invested: 0, current: 0, updated: "" };
      e.invested += Number(i.principal_amount);
      e.current += Number(i.current_value);
      const u = i.updated_at.slice(0, 10);
      if (u > e.updated) e.updated = u;
      map.set(k, e);
    }
    const list = Array.from(map.entries())
      .map(([amc, v]) => ({ amc, ...v }))
      .sort((a, b) => b.current - a.current);
    const total = list.reduce((s, r) => s + r.current, 0);
    return list.map((r) => ({
      ...r,
      pct: total > 0 ? (r.current / total) * 100 : 0,
      gain: r.current - r.invested,
      gainPct: r.invested > 0 ? ((r.current - r.invested) / r.invested) * 100 : null,
      age: daysBetween(r.updated, today),
    }));
  }, [items, today]);

  if (rows.length === 0) return null;
  return (
    <Card title="Mutual funds by AMC" subtitle="Balances are updated by you — compounding funds drift from the last entry" delay={4}>
      <div className="space-y-4">
        {rows.map((r, i) => {
          const positive = r.gain >= 0;
          return (
            <div key={r.amc} className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.amc}</div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    Invested {formatBDT(r.invested)}
                    <span
                      className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: r.age > 30 ? "color-mix(in srgb, var(--warn) 16%, transparent)" : "var(--surface-2)",
                        color: r.age > 30 ? "var(--warn)" : "var(--muted)",
                      }}
                    >
                      <Clock size={9} />
                      {r.age <= 0 ? "updated today" : `updated ${r.age}d ago`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatBDT(r.current)}</div>
                  <div className="text-xs" style={{ color: positive ? "var(--good)" : "var(--bad)" }}>
                    {positive ? "+" : ""}
                    {formatBDT(r.gain)}
                    {r.gainPct !== null && ` (${positive ? "+" : ""}${r.gainPct.toFixed(1)}%)`}
                    <span className="ml-2 text-muted">{r.pct.toFixed(1)}% of funds</span>
                  </div>
                </div>
              </div>
              <PercentBar percent={r.pct} color={colorForIndex(i)} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
