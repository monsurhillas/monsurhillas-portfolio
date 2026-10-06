import type { FinancialInstrument } from "@/lib/types";

// Pure finance helpers for the admin dashboard. Everything takes `today`
// (YYYY-MM-DD) as an argument so these stay deterministic and free of
// render-time impurity; the only clock read is `todayISO()`, which is called
// from server code / event handlers, never from a component body.

const DAY_MS = 24 * 60 * 60 * 1000;

// Bangladesh deposit insurance: Tk 2 lakh per depositor per institution
// (Deposit Protection Bill 2026, up from Tk 1 lakh). Subject to periodic
// review, so it's labelled as an approximation wherever it's shown.
export const DEPOSIT_INSURANCE_LIMIT = 200000;

export function todayISO(): string {
  // en-CA formats as YYYY-MM-DD; pin to Dhaka so "today" matches the user's.
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

function parse(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function format(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return format(parse(iso) + days * DAY_MS);
}

export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return format(target.getTime());
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parse(toIso) - parse(fromIso)) / DAY_MS);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

// ---------------------------------------------------------------- basics

const num = (v: unknown): number => Number(v) || 0;

/** Amount that earns interest: principal, falling back to current value. */
export function interestBase(i: FinancialInstrument): number {
  return num(i.principal_amount) || num(i.current_value);
}

export function isInterestBearing(i: FinancialInstrument): boolean {
  return i.type === "FDR" || i.type === "Sanchaypatra";
}

/** Length of one FDR interest cycle, in days (null when unknowable). */
export function cycleDays(i: FinancialInstrument): number | null {
  if (i.auto_renew && num(i.renewal_tenor_days) > 0) {
    return num(i.renewal_tenor_days);
  }
  if (i.start_date && i.maturity_date) {
    const d = daysBetween(i.start_date, i.maturity_date);
    if (d > 0) return d;
  }
  if (num(i.tenor_months) > 0) return num(i.tenor_months) * 30;
  return null;
}

export interface Interest {
  gross: number;
  tax: number;
  net: number;
}

export function interestFor(
  base: number,
  ratePct: number,
  days: number,
  taxPct: number
): Interest {
  const gross = (base * (ratePct / 100) * days) / 365;
  const tax = gross * (taxPct / 100);
  return { gross, tax, net: gross - tax };
}

// -------------------------------------------------------------- roll-over

export interface RolloverPatch {
  id: string;
  patch: Partial<FinancialInstrument>;
  cycles: number;
}

/**
 * FDRs flagged `auto_renew` whose maturity date has arrived are rolled into
 * the next cycle: start = the maturity date, maturity = start + cycle days.
 * The row is marked `needs_rate_update` because banks re-price on renewal.
 */
export function computeRollovers(
  items: FinancialInstrument[],
  today: string
): RolloverPatch[] {
  const out: RolloverPatch[] = [];
  for (const i of items) {
    if (i.type !== "FDR" || !i.auto_renew || !i.maturity_date) continue;
    const days = num(i.renewal_tenor_days);
    if (days <= 0 || i.maturity_date > today) continue;

    let maturity = i.maturity_date;
    let lastStart = i.maturity_date;
    let cycles = 0;
    while (maturity <= today && cycles < 400) {
      lastStart = maturity;
      maturity = addDays(maturity, days);
      cycles += 1;
    }
    out.push({
      id: i.id,
      cycles,
      patch: {
        start_date: lastStart,
        maturity_date: maturity,
        renewal_count: num(i.renewal_count) + cycles,
        last_renewed_at: lastStart,
        needs_rate_update: true,
      },
    });
  }
  return out;
}

export function applyPatches(
  items: FinancialInstrument[],
  patches: RolloverPatch[]
): FinancialInstrument[] {
  if (patches.length === 0) return items;
  const byId = new Map(patches.map((p) => [p.id, p.patch]));
  return items.map((i) => (byId.has(i.id) ? { ...i, ...byId.get(i.id) } : i));
}

// --------------------------------------------------- upcoming interest

export interface InterestEvent extends Interest {
  id: string;
  label: string;
  kind: "FDR" | "Sanchaypatra";
  date: string;
  base: number;
  rate: number;
  taxRate: number;
  recurring: boolean; // a projected repeat cycle (not the next one)
}

export function instrumentLabel(i: FinancialInstrument): string {
  const tail = i.account_ref ? ` ·${String(i.account_ref).slice(-4)}` : "";
  return `${i.institution || i.type}${tail}`;
}

function sanchaypatraMaturity(i: FinancialInstrument): string | null {
  if (i.maturity_date) return i.maturity_date;
  if (i.start_date && num(i.tenor_months) > 0) {
    return addMonths(i.start_date, num(i.tenor_months));
  }
  return null;
}

const FREQ_MONTHS: Record<string, number> = {
  Monthly: 1,
  Quarterly: 3,
  "Half-yearly": 6,
};

/** All interest payouts expected in (today, today + horizonDays]. */
export function buildInterestEvents(
  items: FinancialInstrument[],
  today: string,
  horizonDays = 365
): InterestEvent[] {
  const limit = addDays(today, horizonDays);
  const events: InterestEvent[] = [];

  for (const i of items) {
    const rate = num(i.interest_rate);
    const base = interestBase(i);
    const taxRate = num(i.tax_rate);
    if (rate <= 0 || base <= 0) continue;

    if (i.type === "FDR" && i.maturity_date) {
      const days = cycleDays(i);
      if (!days) continue;
      const per = interestFor(base, rate, days, taxRate);
      let date = i.maturity_date;
      let n = 0;
      while (date <= limit && n < 40) {
        if (date >= today) {
          events.push({
            ...per,
            id: i.id,
            label: instrumentLabel(i),
            kind: "FDR",
            date,
            base,
            rate,
            taxRate,
            recurring: n > 0,
          });
        }
        if (!i.auto_renew) break;
        date = addDays(date, days);
        n += 1;
      }
    }

    if (i.type === "Sanchaypatra") {
      const maturity = sanchaypatraMaturity(i);
      if (!maturity || !i.start_date) continue;
      const step = FREQ_MONTHS[i.payout_frequency];
      if (!step) {
        // Single payout at maturity covering the full tenor.
        const months = num(i.tenor_months) || 12;
        if (maturity >= today && maturity <= limit) {
          events.push({
            ...interestFor(base, rate, (months / 12) * 365, taxRate),
            id: i.id,
            label: instrumentLabel(i),
            kind: "Sanchaypatra",
            date: maturity,
            base,
            rate,
            taxRate,
            recurring: false,
          });
        }
        continue;
      }
      const per = interestFor(base, rate, (step / 12) * 365, taxRate);
      for (let k = 1; k < 400; k += 1) {
        const date = addMonths(i.start_date, k * step);
        if (date > maturity || date > limit) break;
        if (date < today) continue;
        events.push({
          ...per,
          id: i.id,
          label: instrumentLabel(i),
          kind: "Sanchaypatra",
          date,
          base,
          rate,
          taxRate,
          recurring: false,
        });
      }
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export interface WindowTotals {
  fdr: Interest & { count: number };
  sanchaypatra: Interest & { count: number };
  total: Interest;
}

const zero = (): Interest & { count: number } => ({
  gross: 0,
  tax: 0,
  net: 0,
  count: 0,
});

export function windowTotals(
  events: InterestEvent[],
  today: string,
  days: number
): WindowTotals {
  const end = addDays(today, days);
  const fdr = zero();
  const sp = zero();
  for (const e of events) {
    if (e.date < today || e.date > end) continue;
    const bucket = e.kind === "FDR" ? fdr : sp;
    bucket.gross += e.gross;
    bucket.tax += e.tax;
    bucket.net += e.net;
    bucket.count += 1;
  }
  return {
    fdr,
    sanchaypatra: sp,
    total: {
      gross: fdr.gross + sp.gross,
      tax: fdr.tax + sp.tax,
      net: fdr.net + sp.net,
    },
  };
}

export interface MonthBucket {
  key: string; // YYYY-MM
  label: string;
  fdr: number;
  sanchaypatra: number;
  total: number;
}

export function monthlyTimeline(
  events: InterestEvent[],
  today: string,
  months = 12
): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let m = 0; m < months; m += 1) {
    const key = monthKey(addMonths(today.slice(0, 7) + "-01", m));
    const d = new Date(parse(key + "-01"));
    buckets.push({
      key,
      label: d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }),
      fdr: 0,
      sanchaypatra: 0,
      total: 0,
    });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const e of events) {
    const b = index.get(monthKey(e.date));
    if (!b) continue;
    if (e.kind === "FDR") b.fdr += e.net;
    else b.sanchaypatra += e.net;
    b.total += e.net;
  }
  return buckets;
}

// ------------------------------------------------------- portfolio stats

export interface YieldStats {
  base: number; // total interest-bearing principal with a rate
  weightedRate: number; // % p.a., gross
  annualGross: number;
  annualNet: number;
  effectiveNetRate: number; // % p.a. after tax
}

export function yieldStats(items: FinancialInstrument[]): YieldStats {
  let base = 0;
  let annualGross = 0;
  let annualNet = 0;
  for (const i of items) {
    if (!isInterestBearing(i)) continue;
    const rate = num(i.interest_rate);
    const b = interestBase(i);
    if (rate <= 0 || b <= 0) continue;
    const gross = b * (rate / 100);
    base += b;
    annualGross += gross;
    annualNet += gross * (1 - num(i.tax_rate) / 100);
  }
  return {
    base,
    weightedRate: base > 0 ? (annualGross / base) * 100 : 0,
    annualGross,
    annualNet,
    effectiveNetRate: base > 0 ? (annualNet / base) * 100 : 0,
  };
}

/** Number of DPS installments due on or before `today`. */
export function dpsInstallmentsPaid(
  i: FinancialInstrument,
  today: string
): number {
  if (!i.start_date || num(i.monthly_installment) <= 0) return 0;
  const cap = num(i.tenor_months) || 400;
  let paid = 0;
  for (let k = 0; k < cap; k += 1) {
    if (addMonths(i.start_date, k) <= today) paid += 1;
    else break;
  }
  return paid;
}

/** Principal figure used for the growth stat: DPS = installments paid. */
export function investedAmount(i: FinancialInstrument, today: string): number {
  if (i.type === "DPS" && num(i.monthly_installment) > 0 && i.start_date) {
    return num(i.monthly_installment) * dpsInstallmentsPaid(i, today);
  }
  return num(i.principal_amount);
}

/** Rows whose principal and value disagree so wildly that growth is noise. */
export function isOutlier(i: FinancialInstrument, today: string): boolean {
  const p = investedAmount(i, today);
  const c = num(i.current_value);
  if (p <= 0 || c <= 0) return false;
  const ratio = c / p;
  return ratio > 3 || ratio < 1 / 3;
}

export interface InstitutionExposure {
  institution: string;
  amount: number;
  pct: number;
  overInsured: number;
}

/** Deposit-type holdings (FDR, DPS, Sanchaypatra at banks) by institution. */
export function institutionExposure(
  items: FinancialInstrument[]
): InstitutionExposure[] {
  const map = new Map<string, number>();
  for (const i of items) {
    if (i.type !== "FDR" && i.type !== "DPS" && i.type !== "Sanchaypatra")
      continue;
    const name = (i.institution || "Unspecified")
      .replace(/\b(limited|ltd\.?|plc|bank)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    map.set(name || "Unspecified", (map.get(name) ?? 0) + num(i.current_value));
  }
  const rows = Array.from(map.entries()).map(([institution, amount]) => ({
    institution,
    amount,
  }));
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return rows
    .map((r) => ({
      ...r,
      pct: total > 0 ? (r.amount / total) * 100 : 0,
      overInsured: Math.max(0, r.amount - DEPOSIT_INSURANCE_LIMIT),
    }))
    .sort((a, b) => b.amount - a.amount);
}

// ------------------------------------------------------------ actionables

export type Severity = "high" | "medium" | "low";

export interface Actionable {
  key: string;
  severity: Severity;
  title: string;
  detail: string;
}

const STALE_DAYS = 30;

export function buildActionables(
  items: FinancialInstrument[],
  events: InterestEvent[],
  today: string
): Actionable[] {
  const out: Actionable[] = [];
  const names = (list: FinancialInstrument[], max = 4) => {
    const labels = list.map(instrumentLabel);
    return labels.length > max
      ? `${labels.slice(0, max).join(", ")} +${labels.length - max} more`
      : labels.join(", ");
  };

  // 1. Re-priced FDRs waiting for a rate check.
  const verify = items.filter((i) => i.needs_rate_update);
  if (verify.length) {
    out.push({
      key: "verify-rate",
      severity: "high",
      title: `Confirm the new rate on ${verify.length} renewed FDR${
        verify.length > 1 ? "s" : ""
      }`,
      detail: `${names(verify)}. Banks re-price on renewal — check the portal and confirm below.`,
    });
  }

  // 2. FDRs rolling over this week.
  const soon = items.filter(
    (i) =>
      i.type === "FDR" &&
      i.maturity_date &&
      i.maturity_date >= today &&
      i.maturity_date <= addDays(today, 7)
  );
  if (soon.length) {
    const first = soon.map((i) => i.maturity_date as string).sort()[0];
    out.push({
      key: "rolling-soon",
      severity: "medium",
      title: `${soon.length} FDR${soon.length > 1 ? "s" : ""} mature within 7 days`,
      detail: `${names(soon)} — first on ${first}. ${
        soon.some((i) => i.auto_renew)
          ? "They renew automatically and will be flagged for a rate check."
          : "Decide whether to renew or withdraw."
      }`,
    });
  }

  // 3. Missing / zero rate on interest-bearing holdings.
  const noRate = items.filter(
    (i) =>
      (i.type === "FDR" || i.type === "Sanchaypatra" || i.type === "DPS") &&
      num(i.interest_rate) <= 0
  );
  if (noRate.length) {
    out.push({
      key: "no-rate",
      severity: "medium",
      title: `${noRate.length} holding${noRate.length > 1 ? "s have" : " has"} no interest rate`,
      detail: `${names(noRate)}. Add the rate so projections include them.`,
    });
  }

  // 4. Mutual-fund balances that haven't been refreshed lately.
  const stale = items.filter(
    (i) =>
      (i.type === "Mutual Fund" || i.type === "SIP" || i.type === "Lumpsum") &&
      daysBetween(i.updated_at.slice(0, 10), today) > STALE_DAYS
  );
  if (stale.length) {
    out.push({
      key: "stale-balance",
      severity: "medium",
      title: `Update ${stale.length} fund balance${stale.length > 1 ? "s" : ""}`,
      detail: `${names(stale)} not updated for over ${STALE_DAYS} days. Funds compound, so the NAV-based value drifts.`,
    });
  }

  // 5. Data-quality flags.
  const mismatch = items.filter((i) => {
    if (i.type !== "FDR" && i.type !== "Sanchaypatra") return false;
    const p = num(i.principal_amount);
    const c = num(i.current_value);
    return p > 0 && c > 0 && Math.abs(p - c) / Math.max(p, c) > 0.02;
  });
  if (mismatch.length) {
    out.push({
      key: "mismatch",
      severity: "medium",
      title: `Principal and current value differ on ${mismatch.length} holding${
        mismatch.length > 1 ? "s" : ""
      }`,
      detail: `${names(mismatch)}. Check for typos — interest is calculated on principal.`,
    });
  }
  const noDates = items.filter(
    (i) =>
      (i.type === "FDR" && !i.maturity_date) ||
      (i.type === "Sanchaypatra" && !i.start_date)
  );
  if (noDates.length) {
    out.push({
      key: "no-dates",
      severity: "low",
      title: `${noDates.length} holding${noDates.length > 1 ? "s are" : " is"} missing dates`,
      detail: `${names(noDates)}. Dates drive maturity and payout schedules.`,
    });
  }

  // 6. Rate spread across FDRs.
  const fdrRates = items
    .filter((i) => i.type === "FDR" && num(i.interest_rate) > 0)
    .map((i) => num(i.interest_rate));
  if (fdrRates.length > 1) {
    const lo = Math.min(...fdrRates);
    const hi = Math.max(...fdrRates);
    if (hi - lo >= 1.5) {
      out.push({
        key: "rate-spread",
        severity: "low",
        title: `FDR rates range from ${lo}% to ${hi}%`,
        detail:
          "Compare the lower-rate deposits against current offers when they next renew.",
      });
    }
  }

  // 7. Concentration.
  const exposure = institutionExposure(items);
  if (exposure.length && exposure[0].pct >= 25) {
    out.push({
      key: "concentration",
      severity: "low",
      title: `${exposure[0].institution} holds ${exposure[0].pct.toFixed(0)}% of your deposits`,
      detail: `Deposit insurance covers about Tk ${DEPOSIT_INSURANCE_LIMIT.toLocaleString(
        "en-US"
      )} per institution, so most balances are above the insured amount.`,
    });
  }

  // 8. Cash-flow heads-up.
  const next = events.find((e) => e.date >= today && e.net > 0);
  if (next) {
    out.push({
      key: "next-inflow",
      severity: "low",
      title: `Next interest arrives ${next.date}`,
      detail: `${next.label}: about Tk ${Math.round(next.net).toLocaleString(
        "en-US"
      )} after tax.`,
    });
  }

  const rank: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
