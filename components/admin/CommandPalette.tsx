"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, ExternalLink, LogOut, Moon, Search, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NAV_ITEMS } from "@/lib/admin-nav";
import { useAdminTheme } from "@/lib/use-admin-theme";

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  keywords?: string;
  run: () => void;
}

export default function CommandPalette({
  open,
  onClose,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const router = useRouter();
  const { theme, toggle } = useAdminTheme();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      ...NAV_ITEMS.map((n) => ({
        id: n.href,
        label: n.label,
        hint: "Go to",
        icon: n.icon,
        keywords: n.keywords,
        run: () => router.push(n.href),
      })),
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        hint: "Action",
        icon: theme === "dark" ? Sun : Moon,
        keywords: "appearance mode dark light",
        run: toggle,
      },
      {
        id: "site",
        label: "View public site",
        hint: "Action",
        icon: ExternalLink,
        keywords: "portfolio open",
        run: () => window.open("/", "_blank"),
      },
      {
        id: "signout",
        label: "Sign out",
        hint: "Action",
        icon: LogOut,
        keywords: "logout",
        run: onSignOut,
      },
    ],
    [router, theme, toggle, onSignOut]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  function choose(c: Command | undefined) {
    if (!c) return;
    onClose();
    setQuery("");
    setCursor(0);
    c.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[cursor]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div
      className="fade-in fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[14vh] backdrop-blur-sm"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="pop-in w-full max-w-lg overflow-hidden rounded-2xl border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border-strong)",
          boxShadow: "var(--shadow-pop)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <Search size={16} className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="Jump to a page or run an action…"
            className="bare w-full bg-transparent text-sm outline-none placeholder:text-faint"
          />
          <span className="kbd">esc</span>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              Nothing matches &ldquo;{query}&rdquo;.
            </p>
          ) : (
            results.map((c, i) => {
              const Icon = c.icon;
              const active = i === cursor;
              return (
                <button
                  key={c.id}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => choose(c)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? "bg-accent-soft" : ""
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      active ? "bg-surface-3 text-accent" : "bg-surface-2 text-muted"
                    }`}
                  >
                    <Icon size={15} />
                  </span>
                  <span className="flex-1 truncate font-medium">{c.label}</span>
                  <span className="text-[11px] text-faint">{c.hint}</span>
                  {active && <CornerDownLeft size={13} className="text-muted" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
