import PageHeader from "@/components/admin/ui/PageHeader";
import { getNetWorthEntries, getFinancialGoals } from "@/lib/get-admin-data";
import NetWorthSection from "@/components/admin/NetWorthSection";

export default async function AdminNetWorthPage() {
  const [entries, goals] = await Promise.all([
    getNetWorthEntries(),
    getFinancialGoals(),
  ]);

  return (
    <div>
      <PageHeader title={"Net worth & goals"} description={"Track your net worth over time and progress toward your savings goals."} />
      <NetWorthSection initialEntries={entries} initialGoals={goals} />
    </div>
  );
}
