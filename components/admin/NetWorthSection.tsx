"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Landmark, LineChart as LineIcon, Scale, Target, TrendingDown, TrendingUp } from "lucide-react";
import { NET_WORTH_CONFIG, FINANCIAL_GOAL_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import Card from "./ui/Card";
import Segmented from "./ui/Segmented";
import StatTile from "./ui/StatTile";
import EmptyState from "./ui/EmptyState";
import ChartTooltip, { type TooltipEntry } from "./ui/ChartTooltip";
import { createClient } from "@/lib/supabase/client";
import { formatBDT, formatCompactBDT } from "@/lib/chart-colors";
import type { NetWorthEntry, FinancialGoal } from "@/lib/types";

type View = "dashboard" | "manage";

const shortDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit", timeZone: "UTC" });

export default function NetWorthSection({
  initialEntries,
  initialGoals,
}: {
  initialEntries: NetWorthEntry[];
  initialGoals: FinancialGoal[];
}) {
  const [view, setView] = useState<View>("dashboard");
  const [entries, setEntries] = useState<NetWorthEntry[]>(initialEntries);
  const [goals, setGoals] = useState<FinancialGoal[]>(initialGoals);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const supabase = createClient();

  const onEntries = useCallback((rows: Record<string, unknown>[]) => setEntries(rows as unknown as NetWorthEntry[]), []);
  const onGoals = useCallback((rows: Record<string, unknown>[]) => setGoals(rows as unknown as FinancialGoal[]), []);

  const series = useMemo(
    () =>
      [...entries]
        .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
        .map((e) => ({
          date: e.entry_date,
          label: shortDate(e.entry_date),
          assets: Number(e.total_assets),
          liabilities: Number(e.total_liabilities),
          netWorth: Number(e.total_assets) - Number(e.total_liabilities),
        })),
    [entries]
  );

  const latest = series[series.length - 1];
  const first = series[0];
  const change = latest && first ? latest.netWorth - first.netWorth : 0;
  const changePct = first && first.netWorth !== 0 ? (change / Math.abs(first.netWorth)) * 100 : null;
  const prev = series[series.length - 2];
  const lastStep = latest && prev ? latest.netWorth - prev.netWorth : null;
  const debtRatio = latest && latest.assets > 0 ? (latest.liabilities / latest.assets) * 100 : 0;

  const goalRows = useMemo(
    () =>
      goals.map((g) => {
        const target = Number(g.target_amount);
        const current = Number(g.current_amount);
        const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
        const remaining = Math.max(0, target - current);
        let monthly: number | null = null;
        let daysLeft: number | null = null;
        if (g.target_date) {
          daysLeft = Math.round((Date.parse(g.target_date) - Date.parse(today)) / 86400000);
          const months = Math.max(1, daysLeft / 30.4);
          monthly = daysLeft > 0 ? remaining / months : null;
        }
        return { g, target, current, pct, remaining, monthly, daysLeft };
      }),
    [goals, today]
  );

  if (!supabase) {
    return <p className="text-sm text-[var(--bad)]">Supabase isn&rsquo;t configured in this deployment.</p>;
  }

  return (
    <div className="space-y-5">
      <Segmented
        ariaLabel="Net worth views"
        value={view}
        onChange={setView}
        options={[
          { value: "dashboard", label: "Dashboard" },
          { value: "manage", label: "Manage entries", badge: entries.length + goals.length },
        ]}
      />

      {view === "dashboard" ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Net worth"
              value={latest?.netWorth ?? 0}
              format={(v) => (latest ? formatBDT(v) : "—")}
              icon={Scale}
              tone="accent"
              hint={latest ? `as of ${shortDate(latest.date)}` : "No snapshots yet"}
              delay={1}
            />
            <StatTile
              label="Change since first entry"
              value={change}
              format={(v) => `${v >= 0 ? "+" : ""}${formatBDT(v)}`}
              icon={change >= 0 ? TrendingUp : TrendingDown}
              tone={change >= 0 ? "good" : "bad"}
              hint={changePct === null ? "Add a second snapshot to see growth" : `${changePct >= 0 ? "+" : ""}${changePct.toFixed(1)}% since ${shortDate(first.date)}`}
              delay={2}
            />
            <StatTile
              label="Since last snapshot"
              value={lastStep ?? 0}
              format={(v) => (lastStep === null ? "—" : `${v >= 0 ? "+" : ""}${formatBDT(v)}`)}
              icon={LineIcon}
              tone={lastStep !== null && lastStep < 0 ? "bad" : "good"}
              hint={prev ? `vs ${shortDate(prev.date)}` : "Needs two snapshots"}
              delay={3}
            />
            <StatTile
              label="Debt ratio"
              value={debtRatio}
              format={(v) => `${v.toFixed(1)}%`}
              icon={Landmark}
              tone="warn"
              hint={latest ? `${formatBDT(latest.liabilities)} owed of ${formatBDT(latest.assets)} assets` : "Liabilities ÷ assets"}
              delay={4}
            />
          </div>

          <Card title="Net worth over time" subtitle="Assets, liabilities and what you keep — hover for exact values" delay={2}>
            {series.length < 2 ? (
              <EmptyState
                icon={LineIcon}
                title="Add at least two snapshots"
                hint="Record your total assets and liabilities under “Manage entries” each month to see the trend."
              />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
                    <defs>
                      <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" style={{ stopColor: "var(--series-1)", stopOpacity: 0.38 }} />
                        <stop offset="100%" style={{ stopColor: "var(--series-1)", stopOpacity: 0.02 }} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} minTickGap={24} />
                    <YAxis tickFormatter={formatCompactBDT} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={58} />
                    <Tooltip
                      cursor={{ stroke: "var(--muted)", strokeDasharray: "3 3" }}
                      content={(p) => (
                        <ChartTooltip active={p.active} payload={p.payload as unknown as TooltipEntry[]} label={p.label} format={formatBDT} />
                      )}
                    />
                    <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: "var(--muted)", fontSize: 12 }}>{v}</span>} />
                    <Area type="monotone" dataKey="netWorth" name="Net worth" stroke="var(--series-1)" strokeWidth={2} fill="url(#nwFill)" activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} isAnimationActive={false} />
                    <Area type="monotone" dataKey="assets" name="Assets" stroke="var(--series-3)" strokeWidth={2} fill="none" dot={false} activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }} isAnimationActive={false} />
                    <Area type="monotone" dataKey="liabilities" name="Liabilities" stroke="var(--series-2)" strokeWidth={2} fill="none" dot={false} activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title="Savings goals" subtitle="Progress, what’s left, and the monthly pace each goal needs" delay={3}>
            {goalRows.length === 0 ? (
              <EmptyState icon={Target} title="No goals yet" hint="Add one under “Manage entries” to track it here." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {goalRows.map(({ g, target, current, pct, remaining, monthly, daysLeft }) => {
                  const done = pct >= 100;
                  const tone = done ? "var(--good)" : "var(--accent)";
                  return (
                    <div key={g.id} className="card-interactive rounded-2xl border border-border bg-surface-2/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{g.name}</div>
                          <div className="mt-0.5 text-xs text-muted">
                            {formatBDT(current)} of {formatBDT(target)}
                          </div>
                        </div>
                        <div className="text-xl font-semibold" style={{ color: tone }}>
                          {pct.toFixed(0)}%
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
                        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: done ? "var(--good)" : "var(--grad-brand)" }} />
                      </div>
                      <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted">
                        <span>{done ? "Goal reached" : `${formatBDT(remaining)} to go`}</span>
                        {g.target_date && (
                          <span>
                            {daysLeft !== null && daysLeft < 0
                              ? `Overdue since ${g.target_date}`
                              : `${g.target_date} · ${daysLeft} days`}
                          </span>
                        )}
                        {!done && monthly !== null && <span className="font-medium text-foreground">{formatBDT(monthly)} / month needed</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="space-y-10">
          <GenericEditor config={NET_WORTH_CONFIG} initialItems={entries as unknown as Record<string, unknown>[]} supabase={supabase} onItemsChange={onEntries} />
          <GenericEditor config={FINANCIAL_GOAL_CONFIG} initialItems={goals as unknown as Record<string, unknown>[]} supabase={supabase} onItemsChange={onGoals} />
        </div>
      )}
    </div>
  );
}
