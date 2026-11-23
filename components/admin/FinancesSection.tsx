"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarClock, Percent, PiggyBank, Wallet } from "lucide-react";
import { FINANCIAL_INSTRUMENT_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import { createClient } from "@/lib/supabase/client";
import { formatBDT } from "@/lib/chart-colors";
import {
  buildActionables,
  buildInterestEvents,
  daysBetween,
  windowTotals,
  yieldStats,
} from "@/lib/finance-calc";
import {
  SCOPES,
  byType,
  exposureOf,
  holdingRows,
  inScope,
  institutionKey,
  investedClean,
  rateLadder,
  scopeCounts,
  type Scope,
} from "@/lib/finance-analytics";
import Segmented from "./ui/Segmented";
import StatTile from "./ui/StatTile";
import ScopeBar from "./finance/ScopeBar";
import HeroPanel from "./finance/HeroPanel";
import AllocationCard from "./finance/AllocationCard";
import ExposureCard from "./finance/ExposureCard";
import DrillDown from "./finance/DrillDown";
import ActionablesPanel from "./finance/ActionablesPanel";
import RateQueue from "./finance/RateQueue";
import InterestCards from "./finance/InterestCards";
import IncomeChart from "./finance/IncomeChart";
import RateLadder from "./finance/RateLadder";
import TaxSplit from "./finance/TaxSplit";
import MaturityList from "./finance/MaturityList";
import HoldingsTable from "./finance/HoldingsTable";
import AmcCard from "./finance/AmcCard";
import type { FinancialInstrument } from "@/lib/types";

type Tab = "overview" | "income" | "holdings" | "manage";
type Selection = { kind: "type" | "inst"; key: string } | null;

export default function FinancesSection({
  initialItems,
  today,
}: {
  initialItems: FinancialInstrument[];
  today: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [scope, setScope] = useState<Scope>("all");
  const [selection, setSelection] = useState<Selection>(null);
  const [items, setItems] = useState<FinancialInstrument[]>(initialItems);
  const supabase = createClient();

  const patchItem = useCallback(
    (id: string, patch: Partial<FinancialInstrument>) =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    []
  );
  const onEditorChange = useCallback(
    (rows: Record<string, unknown>[]) => setItems(rows as unknown as FinancialInstrument[]),
    []
  );

  // Everything below the scope row is computed from the scoped slice, so every
  // figure and chart always agrees with the filter.
  const scoped = useMemo(() => items.filter((i) => inScope(i, scope)), [items, scope]);
  const counts = useMemo(() => scopeCounts(items), [items]);

  const events = useMemo(() => buildInterestEvents(scoped, today, 365), [scoped, today]);
  const actions = useMemo(() => buildActionables(scoped, events, today), [scoped, events, today]);
  const stats = useMemo(() => yieldStats(scoped), [scoped]);
  const types = useMemo(() => byType(scoped, today), [scoped, today]);
  const exposure = useMemo(() => exposureOf(scoped), [scoped]);
  const rows = useMemo(() => holdingRows(scoped, events, today), [scoped, events, today]);
  const ladder = useMemo(() => rateLadder(scoped), [scoped]);

  const total = types.reduce((s, r) => s + r.current, 0);
  const invested = useMemo(
    () => scoped.reduce((s, i) => s + investedClean(i, today), 0),
    [scoped, today]
  );
  const next30 = useMemo(() => windowTotals(events, today, 30), [events, today]);
  const nextEvent = events.find((e) => e.net > 0);

  const drillRows = useMemo(() => {
    if (!selection) return [];
    return rows.filter((r) =>
      selection.kind === "type" ? r.type === selection.key : institutionKey(r.item) === selection.key
    );
  }, [rows, selection]);

  function changeScope(s: Scope) {
    setScope(s);
    setSelection(null);
  }

  if (!supabase) {
    return <p className="text-sm text-red-500">Supabase isn&rsquo;t configured in this deployment.</p>;
  }

  const verifyCount = items.filter((i) => i.needs_rate_update).length;
  const scopeLabel = SCOPES.find((s) => s.value === scope)?.label ?? "All";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Finance views"
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview", label: "Overview" },
            { value: "income", label: "Income" },
            { value: "holdings", label: "Holdings", badge: scoped.length },
            { value: "manage", label: "Manage", badge: verifyCount > 0 ? `${verifyCount} to verify` : undefined },
          ]}
        />
        <span className="text-xs text-faint">As of {today}</span>
      </div>

      {tab !== "manage" && <ScopeBar scope={scope} counts={counts} onChange={changeScope} />}

      {tab === "overview" && (
        <div className="space-y-5">
          <HeroPanel
            rows={types}
            total={total}
            invested={invested}
            count={scoped.length}
            selected={selection?.kind === "type" ? selection.key : null}
            onSelect={(t) => setSelection(t ? { kind: "type", key: t } : null)}
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Net interest / year"
              value={stats.annualNet}
              format={formatBDT}
              icon={PiggyBank}
              tone="good"
              hint={`${formatBDT(stats.annualGross)} gross · run-rate`}
              delay={1}
            />
            <StatTile
              label="After-tax yield"
              value={stats.effectiveNetRate}
              format={(v) => `${v.toFixed(2)}%`}
              icon={Percent}
              hint={`${stats.weightedRate.toFixed(2)}% gross on ${formatBDT(stats.base)}`}
              delay={2}
            />
            <StatTile
              label="Next 30 days"
              value={next30.total.net}
              format={formatBDT}
              icon={CalendarClock}
              tone="accent"
              hint={`${next30.fdr.count + next30.sanchaypatra.count} payouts expected`}
              delay={3}
            />
            <StatTile
              label="Next payout"
              value={nextEvent ? Math.max(0, daysBetween(today, nextEvent.date)) : 0}
              format={(v) => (nextEvent ? `in ${Math.round(v)} days` : "—")}
              icon={Wallet}
              tone="warn"
              hint={nextEvent ? `${nextEvent.label} · +${formatBDT(nextEvent.net)} net` : "No payouts scheduled"}
              delay={4}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
            <AllocationCard
              rows={types}
              total={total}
              selected={selection?.kind === "type" ? selection.key : null}
              onSelect={(t) => setSelection(t ? { kind: "type", key: t } : null)}
            />
            <ExposureCard
              rows={exposure}
              selected={selection?.kind === "inst" ? selection.key : null}
              onSelect={(k) => setSelection(k ? { kind: "inst", key: k } : null)}
            />
          </div>

          {selection && (
            <DrillDown
              title={selection.kind === "type" ? selection.key : `${selection.key} deposits`}
              rows={drillRows}
              onClear={() => setSelection(null)}
            />
          )}

          <div className="grid items-start gap-5 xl:grid-cols-2">
            <div className="space-y-5">
              <ActionablesPanel actions={actions} />
              <AmcCard items={scoped} today={today} />
            </div>
            <RateQueue items={items} supabase={supabase} onPatch={patchItem} />
          </div>
        </div>
      )}

      {tab === "income" && (
        <div className="space-y-5">
          <InterestCards events={events} today={today} />
          <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <IncomeChart events={events} today={today} />
            <div className="space-y-5">
              <TaxSplit events={events} today={today} />
            </div>
          </div>
          <RateLadder buckets={ladder.buckets} types={ladder.types} weightedRate={stats.weightedRate} />
          <MaturityList items={scoped} events={events} today={today} />
          <p className="text-xs text-muted">
            Scope: {scopeLabel}. Estimates only — not financial or tax advice.
          </p>
        </div>
      )}

      {tab === "holdings" && <HoldingsTable rows={rows} />}

      {tab === "manage" && (
        <GenericEditor
          config={FINANCIAL_INSTRUMENT_CONFIG}
          initialItems={items as unknown as Record<string, unknown>[]}
          supabase={supabase}
          onItemsChange={onEditorChange}
        />
      )}
    </div>
  );
}
