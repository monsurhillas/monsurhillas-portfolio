"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { NET_WORTH_CONFIG, FINANCIAL_GOAL_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import { createClient } from "@/lib/supabase/client";
import { formatBDT } from "@/lib/chart-colors";
import type { NetWorthEntry, FinancialGoal } from "@/lib/types";

export default function NetWorthSection({
  initialEntries,
  initialGoals,
}: {
  initialEntries: NetWorthEntry[];
  initialGoals: FinancialGoal[];
}) {
  const [view, setView] = useState<"dashboard" | "manage">("dashboard");
  const supabase = createClient();

  const chartData = useMemo(
    () =>
      initialEntries.map((e) => ({
        date: e.entry_date,
        netWorth: Number(e.total_assets) - Number(e.total_liabilities),
      })),
    [initialEntries]
  );

  const latest = initialEntries[initialEntries.length - 1];
  const latestNetWorth = latest
    ? Number(latest.total_assets) - Number(latest.total_liabilities)
    : 0;

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
            {v === "dashboard" ? "Dashboard" : "Manage entries"}
          </button>
        ))}
      </div>

      {view === "dashboard" ? (
        <div>
          <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
            <div className="text-xs text-muted">Latest net worth</div>
            <div className="mt-1 text-2xl font-semibold">
              {latest ? formatBDT(latestNetWorth) : "No snapshots yet"}
            </div>
            {latest && (
              <div className="text-xs text-muted">as of {latest.entry_date}</div>
            )}
          </div>

          {chartData.length > 1 && (
            <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
              <div className="mb-2 text-xs text-muted">Net worth over time</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                  />
                  <Tooltip formatter={(v: number) => formatBDT(v)} />
                  <Line
                    type="monotone"
                    dataKey="netWorth"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 text-xs text-muted">Savings goals</div>
            {initialGoals.length === 0 ? (
              <p className="text-sm text-muted">
                No goals yet — add one under &ldquo;Manage entries&rdquo;.
              </p>
            ) : (
              <div className="space-y-4">
                {initialGoals.map((g) => {
                  const pct = g.target_amount
                    ? Math.min(
                        100,
                        (Number(g.current_amount) / Number(g.target_amount)) *
                          100
                      )
                    : 0;
                  return (
                    <div key={g.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-muted">
                          {formatBDT(Number(g.current_amount))} /{" "}
                          {formatBDT(Number(g.target_amount))}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {g.target_date && (
                        <div className="mt-1 text-xs text-muted">
                          Target date: {g.target_date}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <GenericEditor
            config={NET_WORTH_CONFIG}
            initialItems={
              initialEntries as unknown as Record<string, unknown>[]
            }
            supabase={supabase}
          />
          <GenericEditor
            config={FINANCIAL_GOAL_CONFIG}
            initialItems={
              initialGoals as unknown as Record<string, unknown>[]
            }
            supabase={supabase}
          />
        </div>
      )}
    </div>
  );
}
