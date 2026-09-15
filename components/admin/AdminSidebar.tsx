"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  KeyRound,
  Receipt,
  FolderLock,
  TrendingUp,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Portfolio Update", icon: LayoutDashboard, exact: true },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/finances", label: "Finances", icon: Wallet },
  { href: "/admin/vault", label: "Password Vault", icon: KeyRound },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/documents", label: "Documents", icon: FolderLock },
  { href: "/admin/net-worth", label: "Net Worth & Goals", icon: TrendingUp },
];

export default function AdminSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-accent text-white"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
