"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { FINANCIAL_INSTRUMENT_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import { createClient } from "@/lib/supabase/client";
import { colorForIndex, formatBDT } from "@/lib/chart-colors";
import type { FinancialInstrument } from "@/lib/types";

function yearsBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

export default function FinancesSection({
  initialItems,
}: {
  initialItems: FinancialInstrument[];
}) {
  const [view, setView] = useState<"dashboard" | "manage">("dashboard");
  const supabase = createClient();

  const totalCurrentValue = useMemo(
    () => initialItems.reduce((sum, i) => sum + Number(i.current_value), 0),
    [initialItems]
  );
  const totalPrincipal = useMemo(
    () => initialItems.reduce((sum, i) => sum + Number(i.principal_amount), 0),
    [initialItems]
  );

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of initialItems) {
      map.set(i.type, (map.get(i.type) ?? 0) + Number(i.current_value));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [initialItems]);

  const upcomingMaturities = useMemo(() => {
    const now = new Date();
    const in12mo = new Date();
    in12mo.setMonth(in12mo.getMonth() + 12);
    return initialItems
      .filter(
        (i) =>
          i.maturity_date &&
          new Date(i.maturity_date) >= now &&
          new Date(i.maturity_date) <= in12mo
      )
      .map((i) => {
        const maturity = new Date(i.maturity_date as string);
        const yrs = Math.max(0, yearsBetween(now, maturity));
        const projected =
          Number(i.current_value) *
          (1 + (Number(i.interest_rate) / 100) * yrs);
        return { ...i, projected };
      })
      .sort(
        (a, b) =>
          new Date(a.maturity_date as string).getTime() -
          new Date(b.maturity_date as string).getTime()
      );
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
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-xs text-muted">Total current value</div>
              <div className="mt-1 text-2xl font-semibold">
                {formatBDT(totalCurrentValue)}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-xs text-muted">Total principal invested</div>
              <div className="mt-1 text-2xl font-semibold">
                {formatBDT(totalPrincipal)}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-xs text-muted">Growth so far</div>
              <div className="mt-1 text-2xl font-semibold">
                {totalPrincipal > 0
                  ? `${(((totalCurrentValue - totalPrincipal) / totalPrincipal) * 100).toFixed(1)}%`
                  : "—"}
              </div>
            </div>
          </div>

          {byType.length > 0 && (
            <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
              <div className="mb-2 text-xs text-muted">
                Portfolio breakdown by type
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <ResponsiveContainer
                  width="100%"
                  height={200}
                  className="max-w-[240px]"
                >
                  <PieChart>
                    <Pie
                      data={byType}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={90}
                    >
                      {byType.map((_, i) => (
                        <Cell key={i} fill={colorForIndex(i)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatBDT(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-1 flex-col gap-1.5 text-sm">
                  {byType.map((t, i) => (
                    <div
                      key={t.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: colorForIndex(i) }}
                        />
                        {t.name}
                      </span>
                      <span className="font-medium">{formatBDT(t.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 text-xs text-muted">
              Maturing in the next 12 months
            </div>
            {upcomingMaturities.length === 0 ? (
              <p className="text-sm text-muted">Nothing maturing soon.</p>
            ) : (
              <div className="space-y-3">
                {upcomingMaturities.map((i) => (
                  <div
                    key={i.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {i.institution || i.type} — {i.type}
                      </div>
                      <div className="text-xs text-muted">
                        Matures {i.maturity_date}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        ~{formatBDT(i.projected)}
                      </div>
                      <div className="text-xs text-muted">
                        estimated, not advice
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-muted">
              Projected values use simple interest on the current value and
              are estimates only — not financial advice. Actual maturity
              payouts depend on your instrument&rsquo;s specific terms.
            </p>
          </div>
        </div>
      ) : (
        <GenericEditor
          config={FINANCIAL_INSTRUMENT_CONFIG}
          initialItems={initialItems as unknown as Record<string, unknown>[]}
          supabase={supabase}
        />
      )}
    </div>
  );
}
