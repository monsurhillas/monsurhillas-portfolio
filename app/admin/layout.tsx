import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import LoginCard from "@/components/admin/LoginCard";
import NotAuthorized from "@/components/admin/NotAuthorized";
import AdminShell from "@/components/admin/AdminShell";
import "./admin.css";

// Applies the saved admin theme before paint (default: dark) to avoid a flash.
const THEME_SCRIPT = `try{var t=localStorage.getItem('admin-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-admin-theme',t);}}catch(e){}`;

function Themed({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <div className="admin-root">{children}</div>
    </>
  );
}

// Shared auth gate for the whole /admin route tree (Portfolio Update, Jobs,
// Finances, Vault, Expenses, Documents, Net Worth). Layouts can't read
// searchParams, so the OAuth-callback error message is handled inside
// LoginCard itself via useSearchParams instead of being passed as a prop.
export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const supabase = await createClient();
  if (!supabase)
    return (
      <Themed>
        <LoginCard />
      </Themed>
    );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return (
      <Themed>
        <LoginCard />
      </Themed>
    );
  }

  if (!isAdminEmail(user.email)) {
    return (
      <Themed>
        <NotAuthorized email={user.email} />
      </Themed>
    );
  }

  return (
    <Themed>
      <AdminShell userEmail={user.email}>{children}</AdminShell>
    </Themed>
  );
}
