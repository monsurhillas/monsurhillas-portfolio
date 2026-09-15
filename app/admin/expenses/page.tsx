import { getExpenses } from "@/lib/get-admin-data";
import ExpensesSection from "@/components/admin/ExpensesSection";

export default async function AdminExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Expense tracker
        </h1>
        <p className="text-sm text-muted">
          Log your daily spending and see where it&rsquo;s going.
        </p>
      </div>
      <ExpensesSection initialItems={expenses} />
    </div>
  );
}
