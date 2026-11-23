import {
  applyAutoRollovers,
  getFinancialInstruments,
} from "@/lib/get-admin-data";
import { todayISO } from "@/lib/finance-calc";
import FinancesSection from "@/components/admin/FinancesSection";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function AdminFinancesPage() {
  const today = todayISO();
  const instruments = await applyAutoRollovers(
    await getFinancialInstruments(),
    today
  );

  return (
    <div>
      <PageHeader
        title="Finances"
        description="Where your money stands, what it will earn, and what needs your attention next."
      />
      <FinancesSection initialItems={instruments} today={today} />
    </div>
  );
}
