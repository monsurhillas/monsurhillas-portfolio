"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { BarChart3, CalendarDays } from "lucide-react";
import Card from "../ui/Card";
import Segmented from "../ui/Segmented";
import EmptyState from "../ui/EmptyState";
import ChartTooltip, { type TooltipEntry } from "../ui/ChartTooltip";
import { formatBDT, formatCompactBDT } from "@/lib/chart-colors";
import { monthlyTimeline, type InterestEvent } from "@/lib/finance-calc";

type Mode = "monthly" | "cumulative";

export default function IncomeChart({
  events,
  today,
}: {
  events: InterestEvent[];
  today: string;
}) {
  const [mode, setMode] = useState<Mode>("monthly");
  const [range, setRange] = useState<"6" | "12">("12");
  const [picked, setPicked] = useState<string | null>(null);

  const buckets = useMemo(
    () => monthlyTimeline(events, today, Number(range)),
    [events, today, range]
  );
  const cumulative = useMemo(
    () =>
      buckets.map((b, i) => ({
        ...b,
        cumulative: buckets.slice(0, i + 1).reduce((s, x) => s + x.total, 0),
      })),
    [buckets]
  );

  const total = buckets.reduce((s, b) => s + b.total, 0);
  const defaultKey = buckets.find((b) => b.total > 0)?.key ?? null;
  const activeKey =
    picked && buckets.some((b) => b.key === picked) ? picked : defaultKey;
  const monthEvents = events.filter((e) => e.date.slice(0, 7) === activeKey);
  const monthTotal = monthEvents.reduce((s, e) => s + e.net, 0);
  const monthLabel = buckets.find((b) => b.key === activeKey)?.label;

  const legendFmt = (v: string) => (
    <span style={{ color: "var(--muted)", fontSize: 12 }}>{v}</span>
  );

  return (
    <Card
      title="Interest income"
      subtitle={`${formatBDT(total)} expected over the next ${range} months, after tax`}
      delay={1}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            size="sm"
            ariaLabel="Chart mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "cumulative", label: "Cumulative" },
            ]}
          />
          <Segmented
            size="sm"
            ariaLabel="Range"
            value={range}
            onChange={setRange}
            options={[
              { value: "6", label: "6M" },
              { value: "12", label: "12M" },
            ]}
          />
        </div>
      }
    >
      {total <= 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No interest projected yet"
          hint="Add rates and dates to your FDRs and Sanchaypatra to see expected income."
        />
      ) : (
        <>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              {mode === "monthly" ? (
                <BarChart
                  data={buckets}
                  margin={{ top: 8, right: 4, left: -6, bottom: 0 }}
                  onClick={(s) => {
                    const key = (s as { activePayload?: { payload?: { key?: string } }[] })
                      ?.activePayload?.[0]?.payload?.key;
                    if (key) setPicked(key);
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatCompactBDT} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={58} />
                  <Tooltip
                    cursor={{ fill: "var(--surface-2)", opacity: 0.55 }}
                    content={(p) => (
                      <ChartTooltip
                        active={p.active}
                        payload={p.payload as unknown as TooltipEntry[]}
                        label={p.label}
                        format={formatBDT}
                        footer={() => "Click to list this month’s payouts"}
                      />
                    )}
                  />
                  <Legend iconType="circle" iconSize={8} formatter={legendFmt} />
                  <Bar dataKey="fdr" name="FDR" stackId="i" fill="var(--series-1)" stroke="var(--surface)" strokeWidth={2} maxBarSize={34} cursor="pointer" isAnimationActive={false}>
                    {buckets.map((b) => (
                      <Cell key={b.key} fillOpacity={activeKey && activeKey !== b.key ? 0.4 : 1} />
                    ))}
                  </Bar>
                  <Bar dataKey="sanchaypatra" name="Sanchaypatra" stackId="i" fill="var(--series-2)" stroke="var(--surface)" strokeWidth={2} maxBarSize={34} radius={[6, 6, 0, 0]} cursor="pointer" isAnimationActive={false}>
                    {buckets.map((b) => (
                      <Cell key={b.key} fillOpacity={activeKey && activeKey !== b.key ? 0.4 : 1} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart data={cumulative} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" style={{ stopColor: "var(--series-1)", stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: "var(--series-1)", stopOpacity: 0.02 }} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatCompactBDT} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={58} />
                  <Tooltip
                    cursor={{ stroke: "var(--muted)", strokeDasharray: "3 3" }}
                    content={(p) => {
                      const row = p.payload?.[0]?.payload as { total: number; cumulative: number } | undefined;
                      return (
                        <ChartTooltip
                          active={p.active}
                          payload={
                            row
                              ? ([
                                  { name: "Cumulative", value: row.cumulative, color: "var(--series-1)" },
                                  { name: "This month", value: row.total, color: "var(--muted)" },
                                ] as TooltipEntry[])
                              : []
                          }
                          label={p.label}
                          format={formatBDT}
                        />
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative net interest"
                    stroke="var(--series-1)"
                    strokeWidth={2}
                    fill="url(#cumFill)"
                    activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* payouts behind the selected month */}
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays size={14} className="text-accent" />
                {monthLabel ?? "—"} payouts
              </div>
              <div className="text-sm font-semibold">{formatBDT(monthTotal)}</div>
            </div>
            {monthEvents.length === 0 ? (
              <p className="text-xs text-muted">No payouts this month.</p>
            ) : (
              <div className="divide-y divide-border">
                {monthEvents.map((e, i) => (
                  <div key={`${e.id}-${e.date}-${i}`} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 truncate font-medium">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: e.kind === "FDR" ? "var(--series-1)" : "var(--series-2)" }} />
                        {e.label}
                        {e.recurring && <span className="rounded-full bg-surface-2 px-1.5 text-[10px] text-muted">renewal</span>}
                      </div>
                      <div className="text-xs text-muted">
                        {e.date} · {e.rate.toFixed(2)}% on {formatBDT(e.base)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">+{formatBDT(e.net)}</div>
                      <div className="text-[11px] text-muted">
                        gross {formatBDT(e.gross)} − tax {formatBDT(e.tax)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
