import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  KeyRound,
  Receipt,
  FolderLock,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  keywords?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/admin", label: "Portfolio Update", icon: LayoutDashboard, exact: true, keywords: "profile site content cv" },
      { href: "/admin/jobs", label: "Jobs", icon: Briefcase, keywords: "applications career tracker" },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/admin/finances", label: "Finances", icon: Wallet, keywords: "fdr sanchaypatra dps mutual fund interest invest" },
      { href: "/admin/net-worth", label: "Net Worth & Goals", icon: TrendingUp, keywords: "savings goals assets" },
      { href: "/admin/expenses", label: "Expenses", icon: Receipt, keywords: "spending budget daily" },
    ],
  },
  {
    label: "Secure",
    items: [
      { href: "/admin/vault", label: "Password Vault", icon: KeyRound, keywords: "passwords logins bank social" },
      { href: "/admin/documents", label: "Documents", icon: FolderLock, keywords: "nid passport certificates expiry" },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isActive(item: NavItem, pathname: string): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");
}

export function currentNav(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((i) => isActive(i, pathname));
}
