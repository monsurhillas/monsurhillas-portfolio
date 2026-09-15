import { getNetWorthEntries, getFinancialGoals } from "@/lib/get-admin-data";
import NetWorthSection from "@/components/admin/NetWorthSection";

export default async function AdminNetWorthPage() {
  const [entries, goals] = await Promise.all([
    getNetWorthEntries(),
    getFinancialGoals(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Net worth &amp; goals
        </h1>
        <p className="text-sm text-muted">
          Track your net worth over time and progress toward your savings
          goals.
        </p>
      </div>
      <NetWorthSection initialEntries={entries} initialGoals={goals} />
    </div>
  );
}
