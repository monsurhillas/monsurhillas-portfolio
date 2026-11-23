"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { CalendarDays, Flame, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { EXPENSE_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import Card from "./ui/Card";
import StatTile from "./ui/StatTile";
import EmptyState from "./ui/EmptyState";
import ChartTooltip, { type TooltipEntry } from "./ui/ChartTooltip";
import { createClient } from "@/lib/supabase/client";
import { formatBDT, formatCompactBDT } from "@/lib/chart-colors";
import type { Expense } from "@/lib/types";

// Fixed category → palette slot so a category keeps its colour whatever else
// is in the month.
const CATEGORY_SLOT: Record<string, number> = {
  Food: 1,
  Transport: 2,
  Bills: 3,
  Rent: 4,
  Shopping: 5,
  Health: 6,
  Entertainment: 7,
  Other: 8,
};
const catColor = (c: string) => `var(--series-${CATEGORY_SLOT[c] ?? 8})`;

const monthKey = (d: string) => d.slice(0, 7);

function monthLabel(key: string) {
  const d = new Date(`${key}-01T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

function prevMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function ActiveSector(p: unknown) {
  const s = p as {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
  };
  return (
    <Sector
      cx={s.cx}
      cy={s.cy}
      innerRadius={s.innerRadius - 2}
      outerRadius={s.outerRadius + 7}
      startAngle={s.startAngle}
      endAngle={s.endAngle}
      fill={s.fill}
      stroke="var(--surface)"
      strokeWidth={2}
    />
  );
}

export default function ExpensesSection({
  initialItems,
}: {
  initialItems: Expense[];
}) {
  const supabase = createClient();
  const [items, setItems] = useState<Expense[]>(initialItems);
  const [month, setMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [hoverCat, setHoverCat] = useState<string | null>(null);
  const [pickedCat, setPickedCat] = useState<string | null>(null);

  const onEditorChange = useCallback(
    (rows: Record<string, unknown>[]) => setItems(rows as unknown as Expense[]),
    []
  );

  const trend = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of items) totals.set(monthKey(e.expense_date), (totals.get(monthKey(e.expense_date)) ?? 0) + Number(e.amount));
    // always show the six months ending at the selected one
    const out: { key: string; label: string; total: number }[] = [];
    let k = month;
    for (let i = 0; i < 6; i += 1) {
      out.unshift({ key: k, label: monthLabel(k), total: totals.get(k) ?? 0 });
      k = prevMonth(k);
    }
    return out;
  }, [items, month]);

  const monthItems = useMemo(() => items.filter((e) => monthKey(e.expense_date) === month), [items, month]);
  const total = monthItems.reduce((s, e) => s + Number(e.amount), 0);
  const lastTotal = trend[trend.length - 2]?.total ?? 0;
  const delta = lastTotal > 0 ? ((total - lastTotal) / lastTotal) * 100 : null;

  const categories = useMemo(() => {
    const map = new Map<string, { value: number; count: number }>();
    for (const e of monthItems) {
      const c = map.get(e.category) ?? { value: 0, count: 0 };
      c.value += Number(e.amount);
      c.count += 1;
      map.set(e.category, c);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v, pct: total > 0 ? (v.value / total) * 100 : 0, color: catColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [monthItems, total]);

  const dayCount = month === new Date().toISOString().slice(0, 7)
    ? Math.max(1, new Date().getUTCDate())
    : daysInMonth(month);
  const perDay = total / dayCount;
  const biggest = [...monthItems].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
  const top = categories[0];

  const focusName = hoverCat ?? pickedCat;
  const focusIdx = categories.findIndex((c) => c.name === focusName);
  const focus = focusIdx >= 0 ? categories[focusIdx] : null;
  const listed = pickedCat ? monthItems.filter((e) => e.category === pickedCat) : monthItems;

  const months = useMemo(() => {
    const keys = new Set(items.map((e) => monthKey(e.expense_date)));
    keys.add(new Date().toISOString().slice(0, 7));
    keys.add(month);
    return Array.from(keys).sort().reverse();
  }, [items, month]);

  if (!supabase) {
    return <p className="text-sm text-[var(--bad)]">Supabase isn&rsquo;t configured in this deployment.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-muted">
          <CalendarDays size={14} />
          <span>Month</span>
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPickedCat(null);
            }}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          >
            {months.map((k) => (
              <option key={k} value={k}>
                {monthLabel(k)}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-faint">{monthItems.length} transactions</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Spent this month"
          value={total}
          format={formatBDT}
          icon={Wallet}
          tone="accent"
          hint={
            delta === null ? (
              "No previous month to compare"
            ) : (
              <span className="inline-flex items-center gap-1" style={{ color: delta > 0 ? "var(--bad)" : "var(--good)" }}>
                {delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {delta > 0 ? "+" : ""}
                {delta.toFixed(1)}% vs last month
              </span>
            )
          }
          delay={1}
        />
        <StatTile label="Average per day" value={perDay} format={formatBDT} icon={Flame} tone="warn" hint={`over ${dayCount} days`} delay={2} />
        <StatTile
          label="Top category"
          value={top?.value ?? 0}
          format={(v) => (top ? formatBDT(v) : "—")}
          icon={Receipt}
          tone="good"
          hint={top ? `${top.name} · ${top.pct.toFixed(0)}% of spend` : "Nothing logged yet"}
          delay={3}
        />
        <StatTile
          label="Largest expense"
          value={Number(biggest?.amount ?? 0)}
          format={(v) => (biggest ? formatBDT(v) : "—")}
          icon={Receipt}
          hint={biggest ? `${biggest.description || biggest.category} · ${biggest.expense_date}` : "Nothing logged yet"}
          delay={4}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <Card title="Where it went" subtitle={`${monthLabel(month)} by category — hover a slice, click to filter the list`} delay={2}>
          {categories.length === 0 ? (
            <EmptyState icon={Receipt} title="No spending this month" hint="Add an expense below and it shows up here instantly." />
          ) : (
            <div className="flex flex-col items-center gap-5 md:flex-row">
              <div className="relative h-[210px] w-[210px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={64}
                      outerRadius={92}
                      stroke="var(--surface)"
                      strokeWidth={2}
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive={false}
                      {...({ activeIndex: focusIdx >= 0 ? focusIdx : undefined, activeShape: ActiveSector } as object)}
                      onMouseEnter={(_, i) => setHoverCat(categories[i].name)}
                      onMouseLeave={() => setHoverCat(null)}
                      onClick={(_, i) => setPickedCat(pickedCat === categories[i].name ? null : categories[i].name)}
                    >
                      {categories.map((c) => (
                        <Cell
                          key={c.name}
                          fill={c.color}
                          fillOpacity={pickedCat && pickedCat !== c.name ? 0.35 : 1}
                          style={{ cursor: "pointer", outline: "none" }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted">{focus ? focus.name : "Total"}</div>
                  <div className="text-xl font-semibold leading-tight">{formatCompactBDT(focus ? focus.value : total)}</div>
                  <div className="text-[10px] text-faint">BDT</div>
                  <div className="text-xs text-muted">{focus ? `${focus.pct.toFixed(1)}%` : `${categories.length} categories`}</div>
                </div>
              </div>
              <div className="w-full min-w-0 flex-1 space-y-1">
                {categories.map((c) => (
                  <button
                    key={c.name}
                    onMouseEnter={() => setHoverCat(c.name)}
                    onMouseLeave={() => setHoverCat(null)}
                    onClick={() => setPickedCat(pickedCat === c.name ? null : c.name)}
                    className="block w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-2/70"
                    style={pickedCat === c.name ? { background: "var(--accent-soft)" } : undefined}
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                        <span className="truncate font-medium">{c.name}</span>
                        <span className="text-xs text-faint">{c.count}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2.5">
                        <span className="font-semibold">{formatBDT(c.value)}</span>
                        <span className="w-12 text-right text-xs text-muted">{c.pct.toFixed(1)}%</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card title="Six-month trend" subtitle="Click a bar to jump to that month" delay={3}>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trend}
                margin={{ top: 8, right: 4, left: -6, bottom: 0 }}
                onClick={(s) => {
                  const k = (s as { activePayload?: { payload?: { key?: string } }[] })?.activePayload?.[0]?.payload?.key;
                  if (k) {
                    setMonth(k);
                    setPickedCat(null);
                  }
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatCompactBDT} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={58} />
                <Tooltip
                  cursor={{ fill: "var(--surface-2)", opacity: 0.55 }}
                  content={(p) => (
                    <ChartTooltip active={p.active} payload={p.payload as unknown as TooltipEntry[]} label={p.label} format={formatBDT} />
                  )}
                />
                <Bar dataKey="total" name="Spent" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive={false} cursor="pointer">
                  {trend.map((t) => (
                    <Cell key={t.key} fill="var(--series-1)" fillOpacity={t.key === month ? 1 : 0.45} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {pickedCat && (
        <Card
          title={`${pickedCat} · ${monthLabel(month)}`}
          subtitle={`${listed.length} transaction${listed.length === 1 ? "" : "s"} · ${formatBDT(listed.reduce((s, e) => s + Number(e.amount), 0))}`}
          action={
            <button onClick={() => setPickedCat(null)} className="chip" type="button">
              Clear filter
            </button>
          }
        >
          <div className="divide-y divide-border">
            {listed.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{e.description || e.category}</div>
                  <div className="text-xs text-muted">
                    {e.expense_date}
                    {e.payment_method ? ` · ${e.payment_method}` : ""}
                  </div>
                </div>
                <div className="font-semibold">{formatBDT(Number(e.amount))}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <GenericEditor
        config={EXPENSE_CONFIG}
        initialItems={initialItems as unknown as Record<string, unknown>[]}
        supabase={supabase}
        onItemsChange={onEditorChange}
      />
    </div>
  );
}
