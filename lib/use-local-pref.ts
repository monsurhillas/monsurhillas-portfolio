"use client";

import { useCallback, useSyncExternalStore } from "react";

// A tiny persisted-preference hook (localStorage) that is hydration-safe:
// the server and the first client render both use `fallback`, then the saved
// value takes over. Changes broadcast to every component using the same key.
const EVENT = "local-pref-change";

function read(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function useLocalPref(
  key: string,
  fallback: string
): [string, (value: string) => void] {
  const subscribe = useCallback(
    (cb: () => void) => {
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) cb();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(EVENT, cb);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(EVENT, cb);
      };
    },
    [key]
  );
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback
  );
  const set = useCallback(
    (next: string) => {
      try {
        localStorage.setItem(key, next);
      } catch {
        /* storage unavailable — preference just won't persist */
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key]
  );
  return [value, set];
}
