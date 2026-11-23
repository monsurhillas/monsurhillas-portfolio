"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import Card from "../ui/Card";
import { formatBDT } from "@/lib/chart-colors";
import { useCountUp } from "@/lib/use-count-up";
import type { TypeRow } from "@/lib/finance-analytics";

export default function HeroPanel({
  rows,
  total,
  invested,
  count,
  selected,
  onSelect,
}: {
  rows: TypeRow[];
  total: number;
  invested: number;
  count: number;
  selected: string | null;
  onSelect: (type: string | null) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const animated = useCountUp(total);
  const gain = total - invested;
  const gainPct = invested > 0 ? (gain / invested) * 100 : null;
  const positive = gain >= 0;
  const focus = rows.find((r) => r.type === (hover ?? selected));

  return (
    <Card hero>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
            Total portfolio value
          </div>
          <div className="mt-2 text-[40px] font-semibold leading-none tracking-tight sm:text-5xl">
            <span className="text-brand">{formatBDT(animated)}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
            {gainPct !== null && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  color: positive ? "var(--good)" : "var(--bad)",
                  background: `color-mix(in srgb, ${positive ? "var(--good)" : "var(--bad)"} 14%, transparent)`,
                }}
              >
                {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {positive ? "+" : ""}
                {formatBDT(gain)} · {positive ? "+" : ""}
                {gainPct.toFixed(1)}%
              </span>
            )}
            <span className="text-muted">
              on {formatBDT(invested)} invested · {count} holdings
            </span>
          </div>
        </div>

        {/* readout for the segmented bar: hover or select a segment */}
        <div className="min-h-[3.25rem] min-w-[12rem] text-right text-sm">
          {focus ? (
            <div className="fade-in">
              <div className="flex items-center justify-end gap-2 text-xs text-muted">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: focus.color }} />
                {focus.type} · {focus.count} holding{focus.count > 1 ? "s" : ""}
              </div>
              <div className="text-xl font-semibold">{formatBDT(focus.current)}</div>
              <div className="text-xs text-muted">{focus.pct.toFixed(1)}% of portfolio</div>
            </div>
          ) : (
            <div className="text-xs text-faint">
              Hover a segment for detail,
              <br />
              click to drill into it
            </div>
          )}
        </div>
      </div>

      {/* tall segmented bar: one segment per type, 2px surface gaps */}
      <div className="mt-6 flex h-3.5 gap-[2px] overflow-hidden rounded-full">
        {rows.map((r) => {
          const dim = (hover ?? selected) && (hover ?? selected) !== r.type;
          return (
            <button
              key={r.type}
              aria-label={`${r.type}: ${formatBDT(r.current)}, ${r.pct.toFixed(1)}%`}
              onMouseEnter={() => setHover(r.type)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(r.type)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect(selected === r.type ? null : r.type)}
              className="h-full min-w-[6px] transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${r.pct}%`,
                background: r.color,
                opacity: dim ? 0.3 : 1,
                transform: hover === r.type ? "scaleY(1.35)" : undefined,
              }}
            />
          );
        })}
      </div>

      {/* legend: every segment is named with its value and share */}
      <div className="mt-4 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((r) => (
          <button
            key={r.type}
            onMouseEnter={() => setHover(r.type)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onSelect(selected === r.type ? null : r.type)}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2/70"
            data-active={selected === r.type}
            style={selected === r.type ? { background: "var(--accent-soft)" } : undefined}
          >
            <span className="flex min-w-0 items-center gap-2 text-muted">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
              <span className="truncate">{r.type}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-semibold text-foreground">{formatBDT(r.current)}</span>
              <span className="block text-[11px] text-muted">{r.pct.toFixed(1)}%</span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
