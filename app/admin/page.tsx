import { createClient } from "@/lib/supabase/server";
import { getContent } from "@/lib/get-content";
import { isAdminEmail } from "@/lib/admin";
import LoginCard from "@/components/admin/LoginCard";
import NotAuthorized from "@/components/admin/NotAuthorized";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage({
  searchParams,
}: PageProps<"/admin">) {
  const params = await searchParams;
  const errorParam =
    typeof params?.error === "string" ? params.error : undefined;

  const supabase = await createClient();
  if (!supabase) return <LoginCard error={errorParam} />;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return <LoginCard error={errorParam} />;
  }

  if (!isAdminEmail(user.email)) {
    return <NotAuthorized email={user.email} />;
  }

  const content = await getContent();
  return <AdminDashboard content={content} userEmail={user.email} />;
}
