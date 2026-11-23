"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Download,
  RefreshCw,
  Search,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { formatBDT, typeColor } from "@/lib/chart-colors";
import { toCsv, type HoldingRow } from "@/lib/finance-analytics";

type SortKey = "name" | "type" | "current" | "gainPct" | "rate" | "daysLeft" | "nextNet";

const COLUMNS: { key: SortKey; label: string; align?: "right"; hide?: string }[] = [
  { key: "name", label: "Holding" },
  { key: "type", label: "Type", hide: "hidden md:table-cell" },
  { key: "current", label: "Value", align: "right" },
  { key: "gainPct", label: "Gain", align: "right", hide: "hidden lg:table-cell" },
  { key: "rate", label: "Rate", align: "right", hide: "hidden sm:table-cell" },
  { key: "daysLeft", label: "Matures", align: "right", hide: "hidden md:table-cell" },
  { key: "nextNet", label: "Next interest", align: "right", hide: "hidden lg:table-cell" },
];

function cmp(a: HoldingRow, b: HoldingRow, key: SortKey): number {
  const va = a[key];
  const vb = b[key];
  // nulls always sink to the bottom regardless of direction
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  if (typeof va === "string" && typeof vb === "string") return va.localeCompare(vb);
  return Number(va) - Number(vb);
}

export default function HoldingsTable({ rows }: { rows: HoldingRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "current", dir: -1 });
  const [open, setOpen] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) =>
          `${r.name} ${r.item.account_ref} ${r.type} ${r.item.notes}`.toLowerCase().includes(q)
        )
      : rows;
    const { key, dir } = sort;
    return [...filtered].sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (va === null || vb === null) return cmp(a, b, key);
      return cmp(a, b, key) * dir;
    });
  }, [rows, query, sort]);

  const total = visible.reduce((s, r) => s + r.current, 0);

  function exportCsv() {
    const blob = new Blob([toCsv(visible)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "holdings.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card
      title="All holdings"
      subtitle={`${visible.length} shown · ${formatBDT(total)} · click a row for details`}
      padded={false}
      action={
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/60 px-3 py-1.5 text-xs focus-within:border-accent">
            <Search size={13} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bank, account, type…"
              className="w-40 bg-transparent outline-none placeholder:text-faint sm:w-56"
              aria-label="Search holdings"
            />
          </label>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Download size={13} /> CSV
          </button>
        </div>
      }
    >
      {visible.length === 0 ? (
        <EmptyState icon={Wallet} title="No holdings match" hint="Try a different search or scope." />
      ) : (
        <div className="overflow-x-auto px-2 pb-3">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-faint">
                {COLUMNS.map((c) => {
                  const active = sort.key === c.key;
                  return (
                    <th
                      key={c.key}
                      className={`px-3 py-2.5 font-medium ${c.align === "right" ? "text-right" : "text-left"} ${c.hide ?? ""}`}
                      aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                    >
                      <button
                        onClick={() =>
                          setSort((s) => ({ key: c.key, dir: s.key === c.key ? (s.dir === 1 ? -1 : 1) : -1 }))
                        }
                        className={`inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground ${active ? "text-foreground" : ""}`}
                      >
                        {c.label}
                        {active && (sort.dir === 1 ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                      </button>
                    </th>
                  );
                })}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const isOpen = open === r.id;
                const positive = (r.gainPct ?? 0) >= 0;
                return (
                  <Fragment key={r.id}>
                    <tr
                      onClick={() => setOpen(isOpen ? null : r.id)}
                      className="cursor-pointer border-t border-border transition-colors hover:bg-surface-2/60"
                      style={isOpen ? { background: "var(--accent-soft)" } : undefined}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: typeColor(r.type) }} />
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {r.name} <span className="text-faint">{r.ref}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted md:hidden">
                              {r.type}
                            </div>
                            <div className="hidden items-center gap-1.5 md:flex">
                              {r.item.auto_renew && (
                                <span className="flex items-center gap-1 rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">
                                  <RefreshCw size={9} /> {r.item.renewal_tenor_days}d
                                </span>
                              )}
                              {r.item.needs_rate_update && (
                                <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] text-[var(--warn)]" style={{ background: "color-mix(in srgb, var(--warn) 16%, transparent)" }}>
                                  <ShieldAlert size={9} /> verify rate
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 text-muted md:table-cell">{r.type}</td>
                      <td className="px-3 py-3 text-right font-semibold">{formatBDT(r.current)}</td>
                      <td className="hidden px-3 py-3 text-right lg:table-cell" style={{ color: r.gainPct === null ? "var(--muted)" : positive ? "var(--good)" : "var(--bad)" }}>
                        {r.gainPct === null ? "—" : `${positive ? "+" : ""}${r.gainPct.toFixed(1)}%`}
                      </td>
                      <td className="hidden px-3 py-3 text-right sm:table-cell">{r.rate > 0 ? `${r.rate.toFixed(2)}%` : <span className="text-faint">—</span>}</td>
                      <td className="hidden px-3 py-3 text-right md:table-cell">
                        {r.maturity ? (
                          <>
                            <div>{r.maturity}</div>
                            <div className="text-[11px] text-muted">{r.daysLeft !== null && r.daysLeft >= 0 ? `in ${r.daysLeft}d` : "matured"}</div>
                          </>
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                      </td>
                      <td className="hidden px-3 py-3 text-right lg:table-cell">
                        {r.nextNet !== null ? (
                          <>
                            <div className="font-medium">+{formatBDT(r.nextNet)}</div>
                            <div className="text-[11px] text-muted">{r.nextDate}</div>
                          </>
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                      </td>
                      <td className="px-2 text-muted">
                        <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="fade-in" style={{ background: "var(--accent-soft)" }}>
                        <td colSpan={8} className="px-5 pb-4 pt-1">
                          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-4">
                            {[
                              ["Account", r.item.account_ref || "—"],
                              ["Invested", formatBDT(r.invested)],
                              ["Started", r.item.start_date ?? "—"],
                              ["Matures", r.maturity ?? "—"],
                              ["Tenor", r.item.tenor_months ? `${r.item.tenor_months} months` : "—"],
                              ["Tax on interest", `${r.item.tax_rate}%`],
                              ["Auto-renew", r.item.auto_renew ? `Yes · every ${r.item.renewal_tenor_days}d` : "No"],
                              ["Renewals so far", String(r.item.renewal_count ?? 0)],
                            ].map(([k, v]) => (
                              <div key={k}>
                                <dt className="text-faint">{k}</dt>
                                <dd className="mt-0.5 font-medium">{v}</dd>
                              </div>
                            ))}
                          </dl>
                          {r.item.notes && <p className="mt-3 text-xs text-muted">{r.item.notes}</p>}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
