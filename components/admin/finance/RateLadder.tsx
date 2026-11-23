"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Percent } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import ChartTooltip, { type TooltipEntry } from "../ui/ChartTooltip";
import { formatBDT, formatCompactBDT, typeColor } from "@/lib/chart-colors";
import type { RateBucket } from "@/lib/finance-analytics";

// Category tick: the rate, with the bucket's total tucked underneath so every
// column carries its value without a number floating on each bar.
function RateTick(props: {
  x?: number;
  y?: number;
  payload?: { value: string };
  totals: Record<string, number>;
}) {
  const { x = 0, y = 0, payload, totals } = props;
  const v = payload?.value ?? "";
  return (
    <g transform={`translate(${x},${y})`}>
      <text y={14} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={600}>
        {v}
      </text>
      <text y={30} textAnchor="middle" fill="var(--muted)" fontSize={10}>
        {formatCompactBDT(totals[v] ?? 0)}
      </text>
    </g>
  );
}

export default function RateLadder({
  buckets,
  types,
  weightedRate,
}: {
  buckets: RateBucket[];
  types: string[];
  weightedRate: number;
}) {
  const totals = Object.fromEntries(buckets.map((b) => [b.label, b.total]));
  return (
    <Card
      title="Capital by interest rate"
      subtitle={`How much money earns each rate · weighted average ${weightedRate.toFixed(2)}%`}
      delay={2}
    >
      {buckets.length === 0 ? (
        <EmptyState icon={Percent} title="No rates entered" hint="Add interest rates to see how your capital is spread." />
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ top: 8, right: 4, left: -6, bottom: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                height={40}
                tick={<RateTick totals={totals} />}
              />
              <YAxis tickFormatter={formatCompactBDT} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={58} />
              <Tooltip
                cursor={{ fill: "var(--surface-2)", opacity: 0.55 }}
                content={(p) => (
                  <ChartTooltip
                    active={p.active}
                    payload={p.payload as unknown as TooltipEntry[]}
                    label={p.label}
                    title={(l) => `Earning ${l}`}
                    format={formatBDT}
                  />
                )}
              />
              <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: "var(--muted)", fontSize: 12 }}>{v}</span>} />
              {types.map((t, i) => (
                <Bar
                  key={t}
                  dataKey={t}
                  name={t}
                  stackId="r"
                  fill={typeColor(t)}
                  stroke="var(--surface)"
                  strokeWidth={2}
                  maxBarSize={44}
                  radius={i === types.length - 1 ? [6, 6, 0, 0] : 0}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
