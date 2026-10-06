import { RefreshCw, ShieldAlert } from "lucide-react";
import { formatBDT } from "@/lib/chart-colors";
import {
  addDays,
  addMonths,
  cycleDays,
  daysBetween,
  instrumentLabel,
  type InterestEvent,
} from "@/lib/finance-calc";
import type { FinancialInstrument } from "@/lib/types";

interface Row {
  item: FinancialInstrument;
  date: string;
  event?: InterestEvent;
}

export default function MaturityList({
  items,
  events,
  today,
}: {
  items: FinancialInstrument[];
  events: InterestEvent[];
  today: string;
}) {
  const end = addDays(today, 120);
  const rows: Row[] = [];
  for (const i of items) {
    let date = i.maturity_date;
    if (i.type === "Sanchaypatra" && !date && i.start_date && i.tenor_months) {
      date = addMonths(i.start_date, Number(i.tenor_months));
    }
    if (!date || date < today) continue;
    // Recurring FDRs mature every cycle; list the next one (within 120 days),
    // everything else within the next 12 months.
    const horizon = i.type === "FDR" ? end : addDays(today, 365);
    if (date > horizon) continue;
    const event = events.find(
      (e) => e.id === i.id && e.date === date && e.kind === i.type
    );
    rows.push({ item: i, date, event });
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 text-xs text-muted">
        Upcoming maturities · FDRs next 120 days, others 12 months
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Nothing maturing soon.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(({ item: i, date, event }) => {
            const left = daysBetween(today, date);
            const days = cycleDays(i);
            return (
              <div
                key={`${i.id}-${date}`}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {instrumentLabel(i)} · {i.type}
                    {i.needs_rate_update && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                        <ShieldAlert size={10} /> verify rate
                      </span>
                    )}
                    {i.auto_renew && (
                      <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted">
                        <RefreshCw size={10} /> renews{days ? ` ${days}d` : ""}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted">
                    {date} · {left === 0 ? "today" : `in ${left} day${left === 1 ? "" : "s"}`}{" "}
                    · {Number(i.interest_rate).toFixed(2)}%/yr on{" "}
                    {formatBDT(event?.base ?? Number(i.current_value))}
                  </div>
                </div>
                <div className="text-right text-sm">
                  {event ? (
                    <>
                      <div className="font-medium text-emerald-500">
                        +{formatBDT(event.net)}
                      </div>
                      <div className="text-xs text-muted">
                        gross {formatBDT(event.gross)} − {event.taxRate}% tax{" "}
                        {formatBDT(event.tax)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium">
                        {formatBDT(Number(i.current_value))}
                      </div>
                      <div className="text-xs text-muted">current value</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-xs text-muted">
        Interest = principal × rate × days ÷ 365, minus source tax (10% with
        TIN on FDR interest and on Sanchaypatra above Tk 5 lakh). Estimates
        only — the bank&rsquo;s statement is authoritative.
      </p>
    </div>
  );
}
