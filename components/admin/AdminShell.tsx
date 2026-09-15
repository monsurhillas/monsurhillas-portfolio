"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ExternalLink, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSignOut() {
    await supabase?.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col lg:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
        >
          {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          Menu
        </button>
        <span className="text-sm font-semibold">Admin panel</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } w-full shrink-0 border-b border-border px-4 py-4 lg:block lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-8`}
      >
        <div className="mb-6 hidden lg:block">
          <h1 className="text-lg font-semibold tracking-tight">
            Admin panel
          </h1>
          <p className="mt-1 truncate text-xs text-muted">{userEmail}</p>
        </div>

        <AdminSidebar onNavigate={() => setMobileOpen(false)} />

        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium"
          >
            <ExternalLink size={13} /> View site
          </a>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-red-500"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
