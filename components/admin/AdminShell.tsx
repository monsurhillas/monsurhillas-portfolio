"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { currentNav } from "@/lib/admin-nav";
import { useAdminTheme } from "@/lib/use-admin-theme";
import { useLocalPref } from "@/lib/use-local-pref";
import AdminSidebar from "./AdminSidebar";
import CommandPalette from "./CommandPalette";

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg">
        M
      </span>
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">Monsur</div>
          <div className="text-[11px] text-muted">Control center</div>
        </div>
      )}
    </div>
  );
}

function UserCard({
  email,
  compact,
  onSignOut,
}: {
  email: string;
  compact?: boolean;
  onSignOut: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-border bg-surface-2/60 ${
        compact ? "justify-center p-2" : "p-2.5"
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold uppercase text-accent">
        {email.slice(0, 1)}
      </span>
      {!compact && (
        <>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium">Admin</div>
            <div className="truncate text-[11px] text-muted">{email}</div>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-3 hover:text-[var(--bad)]"
          >
            <LogOut size={14} />
          </button>
        </>
      )}
    </div>
  );
}

export default function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsedPref, setCollapsedPref] = useLocalPref("admin-sidebar", "open");
  const collapsed = collapsedPref === "collapsed";
  const { theme, toggle } = useAdminTheme();
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const nav = currentNav(pathname);

  const handleSignOut = useCallback(async () => {
    await supabase?.auth.signOut();
    router.push("/admin");
    router.refresh();
  }, [supabase, router]);

  // ⌘K / Ctrl+K opens the command palette from anywhere in the admin.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className="sticky top-0 hidden h-screen shrink-0 flex-col justify-between border-r border-border px-3 py-5 transition-[width] duration-300 lg:flex"
        style={{
          width: collapsed ? 76 : 264,
          background: "color-mix(in srgb, var(--surface) 70%, transparent)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="space-y-7 overflow-y-auto">
          <div className={collapsed ? "flex justify-center" : "px-2"}>
            <Brand compact={collapsed} />
          </div>
          <AdminSidebar collapsed={collapsed} />
        </div>
        <div className="space-y-3">
          <UserCard email={userEmail} compact={collapsed} onSignOut={handleSignOut} />
          <button
            onClick={() => setCollapsedPref(collapsed ? "open" : "collapsed")}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight size={15} /> : <><ChevronsLeft size={15} /> Collapse</>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 420, damping: 40 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col justify-between border-r border-border px-4 py-5 lg:hidden"
              style={{ background: "var(--surface)" }}
            >
              <div className="space-y-7 overflow-y-auto">
                <div className="flex items-center justify-between px-1">
                  <Brand />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-1.5 text-muted hover:bg-surface-2"
                    aria-label="Close menu"
                  >
                    <X size={16} />
                  </button>
                </div>
                <AdminSidebar onNavigate={() => setMobileOpen(false)} />
              </div>
              <UserCard email={userEmail} onSignOut={handleSignOut} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6 lg:px-8"
          style={{
            background: "color-mix(in srgb, var(--background) 72%, transparent)",
            backdropFilter: "blur(14px)",
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-border p-2 text-muted lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={16} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{nav?.label ?? "Admin"}</div>
          </div>
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground"
            style={{ borderColor: undefined }}
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search or jump to…</span>
            <span className="kbd hidden sm:inline">⌘K</span>
          </button>
          <button
            onClick={toggle}
            className="rounded-xl border border-border p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground sm:flex"
          >
            <ExternalLink size={13} /> View site
          </a>
        </header>

        <main className="mx-auto w-full max-w-[1320px] min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
