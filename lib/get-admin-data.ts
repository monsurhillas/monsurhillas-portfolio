import { createClient } from "@/lib/supabase/server";
import type {
  JobListing,
  FinancialInstrument,
  VaultCredential,
  Expense,
  DocumentRecord,
  NetWorthEntry,
  FinancialGoal,
} from "@/lib/types";
import { applyPatches, computeRollovers } from "@/lib/finance-calc";

// These fetch private, admin-only tables. Unlike lib/get-content.ts, there
// is no public seed-data fallback here — if Supabase isn't configured or a
// query fails, callers get an empty list. These functions are only ever
// called from within the authenticated /admin route tree.

export async function getJobs(): Promise<JobListing[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as JobListing[]) ?? [];
}

export async function getFinancialInstruments(): Promise<
  FinancialInstrument[]
> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("financial_instruments")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as FinancialInstrument[]) ?? [];
}

export async function getVaultCredentials(): Promise<VaultCredential[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("vault_credentials")
    .select("*")
    .order("website", { ascending: true });
  return (data as VaultCredential[]) ?? [];
}

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });
  return (data as Expense[]) ?? [];
}

export async function getDocuments(): Promise<DocumentRecord[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as DocumentRecord[]) ?? [];
}

// Plain helper (not a component/hook), so it's outside the scope of the
// react-hooks/purity rule that bans impure calls like Date.now() directly
// inside a component or hook body.
export function filterExpiringSoon(
  documents: DocumentRecord[],
  withinDays = 90
): DocumentRecord[] {
  const threshold = Date.now() + withinDays * 24 * 60 * 60 * 1000;
  return documents.filter(
    (d) => d.expiry_date && new Date(d.expiry_date).getTime() < threshold
  );
}

export async function getNetWorthEntries(): Promise<NetWorthEntry[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("net_worth_entries")
    .select("*")
    .order("entry_date", { ascending: true });
  return (data as NetWorthEntry[]) ?? [];
}

export async function getFinancialGoals(): Promise<FinancialGoal[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("financial_goals")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as FinancialGoal[]) ?? [];
}

// Applies due FDR roll-overs (see computeRollovers) and persists them with
// the signed-in admin's session, so the stored dates stay in step with
// reality whenever the Finances page is opened. If a write fails, the
// computed values are still returned so the dashboard stays correct.
export async function applyAutoRollovers(
  items: FinancialInstrument[],
  today: string
): Promise<FinancialInstrument[]> {
  const patches = computeRollovers(items, today);
  if (patches.length === 0) return items;
  const supabase = await createClient();
  if (supabase) {
    await Promise.all(
      patches.map((p) =>
        supabase.from("financial_instruments").update(p.patch).eq("id", p.id)
      )
    );
  }
  return applyPatches(items, patches);
}
