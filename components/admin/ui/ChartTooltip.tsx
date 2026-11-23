import type { ReactNode } from "react";

export interface TooltipEntry {
  name?: string | number;
  value?: number | string;
  color?: string;
  stroke?: string;
  fill?: string;
  payload?: Record<string, unknown>;
}

// One tooltip for every chart: values lead (strong), names follow (muted),
// series are keyed with a short color stroke, per the dataviz spec.
export default function ChartTooltip({
  active,
  payload,
  label,
  format,
  title,
  footer,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  format: (v: number) => string;
  title?: (label: string | number | undefined, payload: TooltipEntry[]) => ReactNode;
  footer?: (payload: TooltipEntry[]) => ReactNode;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const rows = payload.filter((p) => typeof p.value === "number" || p.value);
  const total =
    rows.length > 1
      ? rows.reduce((s, r) => s + (Number(r.value) || 0), 0)
      : null;
  return (
    <div
      className="pop-in min-w-[9rem] rounded-xl border px-3 py-2.5 text-xs shadow-xl"
      style={{
        background: "var(--surface-2)",
        borderColor: "var(--border-strong)",
        boxShadow: "var(--shadow-pop)",
      }}
    >
      <div className="mb-1.5 font-medium text-foreground">
        {title ? title(label, payload) : label}
      </div>
      <div className="space-y-1">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted">
              <span
                className="h-[3px] w-3 rounded-full"
                style={{ background: r.color || r.stroke || r.fill }}
              />
              {r.name}
            </span>
            <span className="font-semibold text-foreground">
              {format(Number(r.value))}
            </span>
          </div>
        ))}
        {total !== null && (
          <div className="mt-1 flex items-center justify-between gap-4 border-t border-border pt-1">
            <span className="text-muted">Total</span>
            <span className="font-semibold text-foreground">{format(total)}</span>
          </div>
        )}
      </div>
      {footer && <div className="mt-1.5 text-muted">{footer(payload)}</div>}
    </div>
  );
}
