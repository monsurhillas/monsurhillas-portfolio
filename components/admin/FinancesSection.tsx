"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Layers } from "lucide-react";
import { FINANCIAL_INSTRUMENT_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import PercentBar from "./PercentBar";
import { createClient } from "@/lib/supabase/client";
import { colorForIndex, formatBDT } from "@/lib/chart-colors";
import { useCountUp } from "@/lib/use-count-up";
import {
  DEPOSIT_INSURANCE_LIMIT,
  buildActionables,
  buildInterestEvents,
  daysBetween,
  institutionExposure,
  investedAmount,
  isOutlier,
  monthlyTimeline,
  yieldStats,
} from "@/lib/finance-calc";
import InterestCards from "./finance/InterestCards";
import ActionablesPanel from "./finance/ActionablesPanel";
import RateQueue from "./finance/RateQueue";
import InterestTimeline from "./finance/InterestTimeline";
import MaturityList from "./finance/MaturityList";
import type { FinancialInstrument } from "@/lib/types";

function GainBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const positive = pct >= 0;
  return (
    <span
      className={`flex shrink-0 items-center gap-0.5 text-xs font-medium ${
        positive ? "text-emerald-500" : "text-red-500"
      }`}
    >
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {positive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

export default function FinancesSection({
  initialItems,
  today,
}: {
  initialItems: FinancialInstrument[];
  today: string;
}) {
  const [view, setView] = useState<"dashboard" | "manage">("dashboard");
  const [items, setItems] = useState<FinancialInstrument[]>(initialItems);
  const supabase = createClient();

  const patchItem = useCallback(
    (id: string, patch: Partial<FinancialInstrument>) =>
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
      ),
    []
  );
  const onEditorChange = useCallback(
    (rows: Record<string, unknown>[]) =>
      setItems(rows as unknown as FinancialInstrument[]),
    []
  );

  // Rows whose principal and value disagree wildly (e.g. a typo'd extra zero)
  // are counted at their current value so they can't distort growth figures;
  // the Actions panel nudges you to fix them.
  const investedOf = useCallback(
    (i: FinancialInstrument) =>
      isOutlier(i, today) ? Number(i.current_value) : investedAmount(i, today),
    [today]
  );
  const outlierCount = useMemo(
    () => items.filter((i) => isOutlier(i, today)).length,
    [items, today]
  );

  const totalCurrentValue = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.current_value), 0),
    [items]
  );
  const totalPrincipal = useMemo(
    () => items.reduce((sum, i) => sum + investedOf(i), 0),
    [items, investedOf]
  );
  const growthPct =
    totalPrincipal > 0
      ? ((totalCurrentValue - totalPrincipal) / totalPrincipal) * 100
      : null;

  // Animated counters — a presentation touch so the dashboard's headline
  // numbers count up/down on load or whenever the underlying data changes,
  // instead of just snapping to a new value.
  const animatedCurrent = useCountUp(totalCurrentValue);
  const animatedPrincipal = useCountUp(totalPrincipal);
  const animatedGrowth = useCountUp(growthPct ?? 0);
  const animatedCount = useCountUp(items.length, 500);

  const events = useMemo(
    () => buildInterestEvents(items, today, 365),
    [items, today]
  );
  const actions = useMemo(
    () => buildActionables(items, events, today),
    [items, events, today]
  );
  const timeline = useMemo(
    () => monthlyTimeline(events, today, 12),
    [events, today]
  );
  const stats = useMemo(() => yieldStats(items), [items]);
  const exposure = useMemo(() => institutionExposure(items), [items]);

  const byType = useMemo(() => {
    const map = new Map<string, { current: number; principal: number }>();
    for (const i of items) {
      const entry = map.get(i.type) ?? { current: 0, principal: 0 };
      entry.current += Number(i.current_value);
      entry.principal += investedOf(i);
      map.set(i.type, entry);
    }
    const rows = Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .filter((x) => x.current > 0)
      .sort((a, b) => b.current - a.current);
    const total = rows.reduce((sum, r) => sum + r.current, 0);
    return rows.map((r) => ({
      ...r,
      pct: total > 0 ? (r.current / total) * 100 : 0,
      gainPct: r.principal > 0 ? ((r.current - r.principal) / r.principal) * 100 : null,
    }));
  }, [items, investedOf]);

  // Mutual funds specifically, broken down by AMC (stored in `institution`)
  // so it's easy to see how much is invested with each fund house, and what
  // share of the mutual-fund sleeve each AMC represents.
  const mutualFundsByAmc = useMemo(() => {
    const map = new Map<
      string,
      { invested: number; current: number; updated: string }
    >();
    for (const i of items) {
      if (i.type !== "Mutual Fund") continue;
      const amc = i.institution || "Unspecified AMC";
      const entry = map.get(amc) ?? { invested: 0, current: 0, updated: "" };
      entry.invested += Number(i.principal_amount);
      entry.current += Number(i.current_value);
      const u = i.updated_at.slice(0, 10);
      if (u > entry.updated) entry.updated = u;
      map.set(amc, entry);
    }
    const rows = Array.from(map.entries())
      .map(([amc, v]) => ({ amc, ...v }))
      .sort((a, b) => b.current - a.current);
    const total = rows.reduce((sum, r) => sum + r.current, 0);
    return rows.map((r) => ({
      ...r,
      pct: total > 0 ? (r.current / total) * 100 : 0,
      gainPct: r.invested > 0 ? ((r.current - r.invested) / r.invested) * 100 : null,
    }));
  }, [items]);

  if (!supabase) {
    return (
      <p className="text-sm text-red-500">
        Supabase isn&rsquo;t configured in this deployment.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-border pb-2">
        {(["dashboard", "manage"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              view === v
                ? "bg-accent text-white"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            {v === "dashboard" ? "Dashboard" : "Manage holdings"}
          </button>
        ))}
      </div>

      {view === "dashboard" ? (
        <div>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-xs text-muted">Total current value</div>
              <div className="mt-1 text-2xl font-semibold">
                {formatBDT(animatedCurrent)}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-xs text-muted">Total invested</div>
              <div className="mt-1 text-2xl font-semibold">
                {formatBDT(animatedPrincipal)}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-xs text-muted">Growth so far</div>
              <div
                className={`mt-1 flex items-center gap-1.5 text-2xl font-semibold ${
                  growthPct === null
                    ? ""
                    : growthPct >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                }`}
              >
                {growthPct !== null &&
                  (growthPct >= 0 ? (
                    <TrendingUp size={18} />
                  ) : (
                    <TrendingDown size={18} />
                  ))}
                {growthPct === null
                  ? "—"
                  : `${growthPct >= 0 ? "+" : ""}${animatedGrowth.toFixed(1)}%`}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-xs text-muted">Active holdings</div>
              <div className="mt-1 flex items-center gap-1.5 text-2xl font-semibold">
                <Layers size={18} className="text-muted" />
                {Math.round(animatedCount)}
              </div>
            </div>
          </div>

          {outlierCount > 0 && (
            <p className="-mt-3 mb-6 text-xs text-muted">
              {outlierCount} holding{outlierCount > 1 ? "s are" : " is"} counted
              at current value in the totals because principal and value
              disagree wildly &mdash; likely a typo; fix it under Manage
              holdings.
            </p>
          )}

          <InterestCards events={events} today={today} />
          <ActionablesPanel actions={actions} />
          <RateQueue items={items} supabase={supabase} onPatch={patchItem} />
          <InterestTimeline buckets={timeline} stats={stats} />
          <MaturityList items={items} events={events} today={today} />

          {byType.length > 0 && (
            <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 text-xs text-muted">
                Portfolio breakdown by type
              </div>
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <ResponsiveContainer
                  width="100%"
                  height={200}
                  className="max-w-[240px] shrink-0"
                >
                  <PieChart>
                    <Pie
                      data={byType}
                      dataKey="current"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={90}
                    >
                      {byType.map((_, i) => (
                        <Cell key={i} fill={colorForIndex(i)} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number, _name, entry) => [
                        `${formatBDT(v)} (${entry.payload.pct.toFixed(1)}%)`,
                        entry.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex w-full flex-1 flex-col gap-3">
                  {byType.map((t, i) => (
                    <div key={t.name} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: colorForIndex(i) }}
                          />
                          <span className="truncate font-medium">
                            {t.name}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <GainBadge pct={t.gainPct} />
                          <span className="font-medium">
                            {formatBDT(t.current)}
                          </span>
                          <span className="w-12 text-right text-xs text-muted">
                            {t.pct.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                      <PercentBar percent={t.pct} color={colorForIndex(i)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mutualFundsByAmc.length > 0 && (
            <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 text-xs text-muted">
                Mutual funds by AMC
              </div>
              <div className="space-y-3">
                {mutualFundsByAmc.map((row, i) => (
                  <div key={row.amc} className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {row.amc}
                        </div>
                        <div className="text-xs text-muted">
                          Invested {formatBDT(row.invested)} · balance updated{" "}
                          {daysBetween(row.updated, today) <= 0
                            ? "today"
                            : `${daysBetween(row.updated, today)}d ago`}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-right">
                        <GainBadge pct={row.gainPct} />
                        <div className="text-sm font-medium">
                          {formatBDT(row.current)}
                        </div>
                        <span className="w-12 text-right text-xs text-muted">
                          {row.pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <PercentBar percent={row.pct} color={colorForIndex(i)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {exposure.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 text-xs text-muted">
                Deposit exposure by institution
              </div>
              <div className="space-y-3">
                {exposure.map((row, i) => (
                  <div key={row.institution} className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium">
                        {row.institution}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatBDT(row.amount)}
                        </span>
                        <span className="w-12 text-right text-xs text-muted">
                          {row.pct.toFixed(1)}%
                        </span>
                      </span>
                    </div>
                    <PercentBar percent={row.pct} color={colorForIndex(i)} />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted">
                FDR + DPS + Sanchaypatra by institution. Deposit insurance
                covers roughly {formatBDT(DEPOSIT_INSURANCE_LIMIT)} per
                depositor per institution (approximate &mdash; confirm with
                Bangladesh Bank), so balances above that rely on the
                institution&rsquo;s own soundness.
              </p>
            </div>
          )}
        </div>
      ) : (
        <GenericEditor
          config={FINANCIAL_INSTRUMENT_CONFIG}
          initialItems={items as unknown as Record<string, unknown>[]}
          supabase={supabase}
          onItemsChange={onEditorChange}
        />
      )}
    </div>
  );
}
