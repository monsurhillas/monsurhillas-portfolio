"use client";

import { useId } from "react";
import { motion } from "framer-motion";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  badge?: string | number;
}

// Pill-style segmented control with a sliding active indicator.
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  ariaLabel,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}) {
  const id = useId();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-border bg-surface-2/70 p-1 [scrollbar-width:none]"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`relative shrink-0 whitespace-nowrap rounded-full font-medium transition-colors ${
              size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-[13px]"
            } ${active ? "text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-full border border-border-strong bg-surface-3 shadow-sm"
                style={{ borderColor: "var(--border-strong)" }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.label}
              {o.badge !== undefined && (
                <span className="rounded-full bg-accent-soft px-1.5 text-[10px] text-accent">
                  {o.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
