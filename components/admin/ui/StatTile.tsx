"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useCountUp } from "@/lib/use-count-up";

// KPI tile: count-up number, icon chip, and a one-line context hint.
export default function StatTile({
  label,
  value,
  format,
  icon: Icon,
  hint,
  tone = "accent",
  delay = 0,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  icon: LucideIcon;
  hint?: ReactNode;
  tone?: "accent" | "good" | "bad" | "warn";
  delay?: number;
}) {
  const animated = useCountUp(value);
  const toneVar = { accent: "--accent", good: "--good", bad: "--bad", warn: "--warn" }[tone];
  return (
    <div
      className="card card-interactive reveal p-5"
      style={{ animationDelay: `${delay * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{
            color: `var(${toneVar})`,
            background: `color-mix(in srgb, var(${toneVar}) 14%, transparent)`,
          }}
        >
          <Icon size={15} />
        </span>
      </div>
      <div className="mt-3 text-[26px] font-semibold leading-none tracking-tight">
        {format(animated)}
      </div>
      {hint && <div className="mt-2 text-xs text-muted">{hint}</div>}
    </div>
  );
}
