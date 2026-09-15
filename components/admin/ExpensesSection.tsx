"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
} from "recharts";
import { EXPENSE_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import { createClient } from "@/lib/supabase/client";
import { colorForIndex, formatBDT } from "@/lib/chart-colors";
import type { Expense } from "@/lib/types";

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export default function ExpensesSection({
  initialItems,
}: {
  initialItems: Expense[];
}) {
  const supabase = createClient();

  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const thisMonthTotal = useMemo(
    () =>
      initialItems
        .filter((e) => monthKey(e.expense_date) === thisMonthKey)
        .reduce((sum, e) => sum + Number(e.amount), 0),
    [initialItems, thisMonthKey]
  );

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of initialItems.filter(
      (e) => monthKey(e.expense_date) === thisMonthKey
    )) {
      map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [initialItems, thisMonthKey]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of initialItems) {
      const k = monthKey(e.expense_date);
      map.set(k, (map.get(k) ?? 0) + Number(e.amount));
    }
    return Array.from(map.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [initialItems]);

  if (!supabase) {
    return (
      <p className="text-sm text-red-500">
        Supabase isn&rsquo;t configured in this deployment.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="text-xs text-muted">This month&rsquo;s spending</div>
          <div className="mt-1 text-2xl font-semibold">
            {formatBDT(thisMonthTotal)}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-1 text-xs text-muted">Last 6 months</div>
          {monthlyTrend.length === 0 ? (
            <p className="text-sm text-muted">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={monthlyTrend}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => formatBDT(v)}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {categoryBreakdown.length > 0 && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
          <div className="mb-2 text-xs text-muted">
            This month by category
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <ResponsiveContainer width="100%" height={180} className="max-w-[220px]">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={80}
                >
                  {categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={colorForIndex(i)} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatBDT(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-1 flex-col gap-1.5 text-sm">
              {categoryBreakdown.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: colorForIndex(i) }}
                    />
                    {c.name}
                  </span>
                  <span className="font-medium">{formatBDT(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <GenericEditor
        config={EXPENSE_CONFIG}
        initialItems={initialItems as unknown as Record<string, unknown>[]}
        supabase={supabase}
      />
    </div>
  );
}
