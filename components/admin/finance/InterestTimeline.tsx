"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatBDT } from "@/lib/chart-colors";
import type { MonthBucket, YieldStats } from "@/lib/finance-calc";

const FDR_COLOR = "#6366f1";
const SP_COLOR = "#10b981";

function compact(v: number): string {
  if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return String(Math.round(v));
}

export default function InterestTimeline({
  buckets,
  stats,
}: {
  buckets: MonthBucket[];
  stats: YieldStats;
}) {
  const total = buckets.reduce((s, b) => s + b.total, 0);
  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
      <div className="mb-1 text-xs text-muted">
        Interest income · next 12 months (after tax)
      </div>
      <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div className="text-xl font-semibold">{formatBDT(total)}</div>
        <div className="text-xs text-muted">
          Yield on interest-bearing holdings:{" "}
          <span className="font-medium text-foreground">
            {stats.weightedRate.toFixed(2)}%
          </span>{" "}
          gross ·{" "}
          <span className="font-medium text-foreground">
            {stats.effectiveNetRate.toFixed(2)}%
          </span>{" "}
          after tax · run-rate {formatBDT(stats.annualNet)}/yr net
        </div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={buckets} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={compact}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(v: number, name) => [formatBDT(v), name]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar
            dataKey="fdr"
            name="FDR"
            stackId="i"
            fill={FDR_COLOR}
            stroke="var(--surface)"
            strokeWidth={2}
            maxBarSize={28}
          />
          <Bar
            dataKey="sanchaypatra"
            name="Sanchaypatra"
            stackId="i"
            fill={SP_COLOR}
            stroke="var(--surface)"
            strokeWidth={2}
            maxBarSize={28}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-3 text-xs text-muted">
        Assumes recurring FDRs renew at today&rsquo;s rate; renewals can be
        re-priced. Estimates only, not financial or tax advice.
      </p>
    </div>
  );
}
