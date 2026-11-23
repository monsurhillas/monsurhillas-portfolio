"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import Card from "../ui/Card";
import PercentBar from "../PercentBar";
import { formatBDT, formatCompactBDT } from "@/lib/chart-colors";
import type { TypeRow } from "@/lib/finance-analytics";

type SectorProps = {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
};

function ActiveSector(p: unknown) {
  const s = p as SectorProps;
  return (
    <Sector
      cx={s.cx}
      cy={s.cy}
      innerRadius={s.innerRadius - 2}
      outerRadius={s.outerRadius + 8}
      startAngle={s.startAngle}
      endAngle={s.endAngle}
      fill={s.fill}
      stroke="var(--surface)"
      strokeWidth={2}
    />
  );
}

export default function AllocationCard({
  rows,
  total,
  selected,
  onSelect,
}: {
  rows: TypeRow[];
  total: number;
  selected: string | null;
  onSelect: (type: string | null) => void;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const selIdx = rows.findIndex((r) => r.type === selected);
  const activeIdx = hoverIdx ?? (selIdx >= 0 ? selIdx : null);
  const active = activeIdx !== null ? rows[activeIdx] : null;

  return (
    <Card
      title="Allocation"
      subtitle="Where your money sits — hover a slice or row, click to drill down"
      delay={2}
      fill
    >
      <div className="flex h-full flex-col items-center gap-6 md:flex-row md:items-center">
        <div className="relative h-[230px] w-[230px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="current"
                nameKey="type"
                innerRadius={72}
                outerRadius={100}
                paddingAngle={0}
                stroke="var(--surface)"
                strokeWidth={2}
                startAngle={90}
                endAngle={-270}
                {...({
                  activeIndex: activeIdx ?? undefined,
                  activeShape: ActiveSector,
                } as object)}
                onMouseEnter={(_, i) => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                onClick={(_, i) =>
                  onSelect(selected === rows[i].type ? null : rows[i].type)
                }
                isAnimationActive
                animationDuration={700}
              >
                {rows.map((r) => (
                  <Cell
                    key={r.type}
                    fill={r.color}
                    fillOpacity={selected && selected !== r.type ? 0.35 : 1}
                    style={{ cursor: "pointer", outline: "none" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
              {active ? active.type : "Total"}
            </div>
            <div className="text-xl font-semibold leading-tight">
              {formatCompactBDT(active ? active.current : total)}
            </div>
            <div className="text-[10px] text-faint">BDT</div>
            <div className="text-xs text-muted">
              {active ? `${active.pct.toFixed(1)}%` : `${rows.length} ${rows.length === 1 ? "type" : "types"}`}
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 space-y-1">
          {rows.map((r, i) => {
            const isSel = selected === r.type;
            const positive = (r.gainPct ?? 0) >= 0;
            return (
              <button
                key={r.type}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                onClick={() => onSelect(isSel ? null : r.type)}
                className="block w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-2/70"
                style={isSel ? { background: "var(--accent-soft)" } : undefined}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
                    <span className="truncate font-medium">{r.type}</span>
                    <span className="text-xs text-faint">{r.count}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5">
                    {r.gainPct !== null && (
                      <span
                        className="flex items-center gap-0.5 text-xs font-medium"
                        style={{ color: positive ? "var(--good)" : "var(--bad)" }}
                      >
                        {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {positive ? "+" : ""}
                        {r.gainPct.toFixed(1)}%
                      </span>
                    )}
                    <span className="font-semibold">{formatBDT(r.current)}</span>
                    <span className="w-12 text-right text-xs text-muted">{r.pct.toFixed(1)}%</span>
                  </span>
                </div>
                <div className="mt-1.5">
                  <PercentBar percent={r.pct} color={r.color} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
