"use client";

import { useCallback, useSyncExternalStore } from "react";

export type AdminTheme = "dark" | "light";

// The <html data-admin-theme> attribute is the source of truth (set before
// paint by the script in app/admin/layout.tsx); this hook just observes it.
function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-admin-theme"],
  });
  return () => observer.disconnect();
}

const snapshot = (): AdminTheme =>
  document.documentElement.getAttribute("data-admin-theme") === "light"
    ? "light"
    : "dark";

export function useAdminTheme() {
  const theme = useSyncExternalStore<AdminTheme>(
    subscribe,
    snapshot,
    () => "dark"
  );
  const setTheme = useCallback((t: AdminTheme) => {
    document.documentElement.setAttribute("data-admin-theme", t);
    try {
      localStorage.setItem("admin-theme", t);
    } catch {
      /* ignore */
    }
  }, []);
  const toggle = useCallback(
    () => setTheme(snapshot() === "dark" ? "light" : "dark"),
    [setTheme]
  );
  return { theme, setTheme, toggle };
}
