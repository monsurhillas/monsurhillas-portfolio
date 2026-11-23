"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, FileText, ShieldAlert } from "lucide-react";
import { DOCUMENT_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import StatTile from "./ui/StatTile";
import { createClient } from "@/lib/supabase/client";
import type { DocumentRecord } from "@/lib/types";

export default function DocumentsSection({
  initialItems,
}: {
  initialItems: DocumentRecord[];
  expiringSoon?: DocumentRecord[];
}) {
  const supabase = createClient();
  const [items, setItems] = useState<DocumentRecord[]>(initialItems);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const onChange = useCallback(
    (rows: Record<string, unknown>[]) => setItems(rows as unknown as DocumentRecord[]),
    []
  );

  const { expired, soon } = useMemo(() => {
    const limit = new Date(Date.parse(today) + 90 * 86400000).toISOString().slice(0, 10);
    const withDate = items.filter((d) => d.expiry_date);
    return {
      expired: withDate.filter((d) => (d.expiry_date as string) < today),
      soon: withDate.filter((d) => (d.expiry_date as string) >= today && (d.expiry_date as string) <= limit),
    };
  }, [items, today]);

  if (!supabase) {
    return <p className="text-sm text-[var(--bad)]">Supabase isn&rsquo;t configured in this deployment.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Documents" value={items.length} format={(v) => String(Math.round(v))} icon={FileText} tone="accent" hint="stored records" delay={1} />
        <StatTile label="Expiring in 90 days" value={soon.length} format={(v) => String(Math.round(v))} icon={CalendarClock} tone="warn" hint={soon.length ? soon.map((d) => d.title).join(", ") : "Nothing due soon"} delay={2} />
        <StatTile label="Expired" value={expired.length} format={(v) => String(Math.round(v))} icon={ShieldAlert} tone={expired.length ? "bad" : "good"} hint={expired.length ? expired.map((d) => d.title).join(", ") : "All current"} delay={3} />
      </div>

      {(soon.length > 0 || expired.length > 0) && (
        <div
          className="flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--warn) 40%, transparent)",
            background: "color-mix(in srgb, var(--warn) 10%, transparent)",
          }}
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: "var(--warn)" }} />
          <p>
            {expired.length > 0 && (
              <>
                <strong>{expired.length}</strong> expired: {expired.map((d) => d.title).join(", ")}.{" "}
              </>
            )}
            {soon.length > 0 && (
              <>
                <strong>{soon.length}</strong> expiring within 90 days: {soon.map((d) => d.title).join(", ")}.
              </>
            )}
          </p>
        </div>
      )}

      <GenericEditor
        config={DOCUMENT_CONFIG}
        initialItems={initialItems as unknown as Record<string, unknown>[]}
        supabase={supabase}
        onItemsChange={onChange}
      />
    </div>
  );
}
