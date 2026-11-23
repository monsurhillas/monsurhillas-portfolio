import PageHeader from "@/components/admin/ui/PageHeader";
import { getExpenses } from "@/lib/get-admin-data";
import ExpensesSection from "@/components/admin/ExpensesSection";

export default async function AdminExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div>
      <PageHeader title={"Expense tracker"} description={"Log your daily spending and see where it’s going."} />
      <ExpensesSection initialItems={expenses} />
    </div>
  );
}
