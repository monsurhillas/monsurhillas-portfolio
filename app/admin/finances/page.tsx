import {
  applyAutoRollovers,
  getFinancialInstruments,
} from "@/lib/get-admin-data";
import { todayISO } from "@/lib/finance-calc";
import FinancesSection from "@/components/admin/FinancesSection";

export default async function AdminFinancesPage() {
  const today = todayISO();
  const instruments = await applyAutoRollovers(
    await getFinancialInstruments(),
    today
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Finances</h1>
        <p className="text-sm text-muted">
          Where your money stands, what it will earn, and what needs your
          attention next.
        </p>
      </div>
      <FinancesSection initialItems={instruments} today={today} />
    </div>
  );
}
