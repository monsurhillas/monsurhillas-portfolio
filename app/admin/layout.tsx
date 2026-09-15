import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import LoginCard from "@/components/admin/LoginCard";
import NotAuthorized from "@/components/admin/NotAuthorized";
import AdminShell from "@/components/admin/AdminShell";

// Shared auth gate for the whole /admin route tree (Portfolio Update, Jobs,
// Finances, Vault, Expenses, Documents, Net Worth). Layouts can't read
// searchParams, so the OAuth-callback error message is handled inside
// LoginCard itself via useSearchParams instead of being passed as a prop.
export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const supabase = await createClient();
  if (!supabase) return <LoginCard />;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return <LoginCard />;
  }

  if (!isAdminEmail(user.email)) {
    return <NotAuthorized email={user.email} />;
  }

  return <AdminShell userEmail={user.email}>{children}</AdminShell>;
}
