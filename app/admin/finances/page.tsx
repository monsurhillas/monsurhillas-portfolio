import { getFinancialInstruments } from "@/lib/get-admin-data";
import FinancesSection from "@/components/admin/FinancesSection";

export default async function AdminFinancesPage() {
  const instruments = await getFinancialInstruments();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Finances</h1>
        <p className="text-sm text-muted">
          Your DPS, FDR, SIP, lumpsum, and mutual fund holdings, with an
          overview of your portfolio&rsquo;s size and maturities.
        </p>
      </div>
      <FinancesSection initialItems={instruments} />
    </div>
  );
}
