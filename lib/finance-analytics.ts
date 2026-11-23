import type { FinancialInstrument } from "@/lib/types";
import {
  daysBetween,
  institutionExposure,
  interestBase,
  isOutlier,
  investedAmount,
  sanchaypatraMaturity,
  type InterestEvent,
} from "@/lib/finance-calc";
import { typeColor } from "@/lib/chart-colors";

// ----------------------------------------------------------------- scope

export type Scope = "all" | "FDR" | "Sanchaypatra" | "DPS" | "Funds" | "Other";

export const SCOPES: { value: Scope; label: string; types: string[] | null }[] = [
  { value: "all", label: "All", types: null },
  { value: "FDR", label: "FDR", types: ["FDR"] },
  { value: "Sanchaypatra", label: "Sanchaypatra", types: ["Sanchaypatra"] },
  { value: "DPS", label: "DPS", types: ["DPS"] },
  { value: "Funds", label: "Funds", types: ["Mutual Fund", "SIP", "Lumpsum"] },
  { value: "Other", label: "Other", types: ["Other"] },
];

export function inScope(i: FinancialInstrument, scope: Scope): boolean {
  const s = SCOPES.find((x) => x.value === scope);
  return !s?.types || s.types.includes(i.type);
}

export function scopeCounts(items: FinancialInstrument[]): Record<Scope, number> {
  const out = {} as Record<Scope, number>;
  for (const s of SCOPES) out[s.value] = items.filter((i) => inScope(i, s.value)).length;
  return out;
}

// ------------------------------------------------------------ aggregates

const n = (v: unknown) => Number(v) || 0;

export function investedClean(i: FinancialInstrument, today: string): number {
  return isOutlier(i, today) ? n(i.current_value) : investedAmount(i, today);
}

export interface TypeRow {
  type: string;
  current: number;
  invested: number;
  pct: number;
  gain: number;
  gainPct: number | null;
  count: number;
  color: string;
}

export function byType(items: FinancialInstrument[], today: string): TypeRow[] {
  const map = new Map<string, { current: number; invested: number; count: number }>();
  for (const i of items) {
    const e = map.get(i.type) ?? { current: 0, invested: 0, count: 0 };
    e.current += n(i.current_value);
    e.invested += investedClean(i, today);
    e.count += 1;
    map.set(i.type, e);
  }
  const rows = Array.from(map.entries())
    .map(([type, v]) => ({ type, ...v }))
    .filter((r) => r.current > 0)
    .sort((a, b) => b.current - a.current);
  const total = rows.reduce((s, r) => s + r.current, 0);
  return rows.map((r) => ({
    ...r,
    pct: total > 0 ? (r.current / total) * 100 : 0,
    gain: r.current - r.invested,
    gainPct: r.invested > 0 ? ((r.current - r.invested) / r.invested) * 100 : null,
    color: typeColor(r.type),
  }));
}

export function exposureOf(items: FinancialInstrument[]) {
  return institutionExposure(items);
}

/** Normalised institution key shared with institutionExposure(). */
export function institutionKey(i: FinancialInstrument): string {
  const name = (i.institution || "Unspecified")
    .replace(/\b(limited|ltd\.?|plc|bank)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return name || "Unspecified";
}

// -------------------------------------------------------------- holdings

export interface HoldingRow {
  item: FinancialInstrument;
  id: string;
  name: string;
  ref: string;
  type: string;
  invested: number;
  current: number;
  gainPct: number | null;
  rate: number;
  maturity: string | null;
  daysLeft: number | null;
  nextNet: number | null;
  nextDate: string | null;
}

export function holdingRows(
  items: FinancialInstrument[],
  events: InterestEvent[],
  today: string
): HoldingRow[] {
  const firstEvent = new Map<string, InterestEvent>();
  for (const e of events) if (!firstEvent.has(e.id)) firstEvent.set(e.id, e);
  return items.map((i) => {
    const maturity =
      i.type === "Sanchaypatra" ? sanchaypatraMaturity(i) : i.maturity_date;
    const invested = investedClean(i, today);
    const current = n(i.current_value);
    const ev = firstEvent.get(i.id);
    return {
      item: i,
      id: i.id,
      name: i.institution || i.type,
      ref: i.account_ref ? `…${String(i.account_ref).slice(-4)}` : "",
      type: i.type,
      invested,
      current,
      gainPct: invested > 0 ? ((current - invested) / invested) * 100 : null,
      rate: n(i.interest_rate),
      maturity,
      daysLeft: maturity ? daysBetween(today, maturity) : null,
      nextNet: ev ? ev.net : null,
      nextDate: ev ? ev.date : null,
    };
  });
}

// ----------------------------------------------------------- rate ladder

export interface RateBucket {
  rate: number;
  label: string;
  total: number;
  [type: string]: number | string;
}

/** Capital grouped by interest rate, split by type — "what earns what". */
export function rateLadder(items: FinancialInstrument[]): {
  buckets: RateBucket[];
  types: string[];
} {
  const map = new Map<number, RateBucket>();
  const types = new Set<string>();
  for (const i of items) {
    const rate = n(i.interest_rate);
    if (rate <= 0) continue;
    if (i.type !== "FDR" && i.type !== "Sanchaypatra" && i.type !== "DPS") continue;
    const base = i.type === "DPS" ? n(i.current_value) : interestBase(i);
    const key = Math.round(rate * 100) / 100;
    const b = map.get(key) ?? { rate: key, label: `${key.toFixed(2)}%`, total: 0 };
    b[i.type] = (Number(b[i.type]) || 0) + base;
    b.total += base;
    types.add(i.type);
    map.set(key, b);
  }
  return {
    buckets: Array.from(map.values()).sort((a, b) => a.rate - b.rate),
    types: Array.from(types),
  };
}

// ------------------------------------------------------------- utilities

export function toCsv(rows: HoldingRow[]): string {
  const head = [
    "Institution",
    "Account",
    "Type",
    "Invested",
    "Current value",
    "Rate %",
    "Maturity",
    "Days left",
    "Next net interest",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.name,
      r.item.account_ref,
      r.type,
      Math.round(r.invested),
      Math.round(r.current),
      r.rate,
      r.maturity ?? "",
      r.daysLeft ?? "",
      r.nextNet !== null ? Math.round(r.nextNet) : "",
    ]
      .map(esc)
      .join(",")
  );
  return [head.map(esc).join(","), ...lines].join("\n");
}
