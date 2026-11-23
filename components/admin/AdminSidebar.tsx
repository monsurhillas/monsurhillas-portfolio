"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_GROUPS, isActive } from "@/lib/admin-nav";

export default function AdminSidebar({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5" aria-label="Admin sections">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
              {group.label}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item, pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl py-2.5 text-[13px] font-medium transition-colors ${
                    collapsed ? "justify-center px-0" : "px-3"
                  } ${
                    active
                      ? "text-foreground"
                      : "text-muted hover:bg-surface-2/70 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      className="absolute inset-0 rounded-xl border"
                      style={{
                        background: "var(--accent-soft)",
                        borderColor:
                          "color-mix(in srgb, var(--accent) 35%, transparent)",
                      }}
                    />
                  )}
                  {active && !collapsed && (
                    <span className="bg-brand absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full" />
                  )}
                  <Icon
                    size={17}
                    className={`relative shrink-0 transition-colors ${
                      active ? "text-accent" : "group-hover:text-foreground"
                    }`}
                  />
                  {!collapsed && <span className="relative truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
