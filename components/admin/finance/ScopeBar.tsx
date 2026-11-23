"use client";

import { SCOPES, type Scope } from "@/lib/finance-analytics";

// One filter row above the content; scopes every figure and chart below it.
export default function ScopeBar({
  scope,
  counts,
  onChange,
}: {
  scope: Scope;
  counts: Record<Scope, number>;
  onChange: (s: Scope) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter holdings">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
        Scope
      </span>
      {SCOPES.map((s) => (
        <button
          key={s.value}
          className="chip"
          data-active={scope === s.value}
          onClick={() => onChange(s.value)}
        >
          {s.label}
          <span className="text-faint">{counts[s.value]}</span>
        </button>
      ))}
    </div>
  );
}
