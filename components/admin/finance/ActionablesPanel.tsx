import { AlertTriangle, Info, CircleAlert, CheckCircle2 } from "lucide-react";
import type { Actionable, Severity } from "@/lib/finance-calc";

const STYLE: Record<
  Severity,
  { icon: typeof Info; tone: string; label: string }
> = {
  high: { icon: CircleAlert, tone: "text-red-500 bg-red-500/10", label: "Do now" },
  medium: {
    icon: AlertTriangle,
    tone: "text-amber-500 bg-amber-500/10",
    label: "Soon",
  },
  low: { icon: Info, tone: "text-sky-500 bg-sky-500/10", label: "FYI" },
};

export default function ActionablesPanel({
  actions,
}: {
  actions: Actionable[];
}) {
  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 text-xs text-muted">What needs your attention</div>
      {actions.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-emerald-500">
          <CheckCircle2 size={16} /> Nothing pending — all up to date.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {actions.map((a) => {
            const s = STYLE[a.severity];
            const Icon = s.icon;
            return (
              <li key={a.key} className="flex gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${s.tone}`}
                >
                  <Icon size={13} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {a.title}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${s.tone}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="text-xs text-muted">{a.detail}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
