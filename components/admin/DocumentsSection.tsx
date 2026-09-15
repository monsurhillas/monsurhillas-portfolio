"use client";

import { DOCUMENT_CONFIG } from "@/lib/admin-fields";
import GenericEditor from "./GenericEditor";
import { createClient } from "@/lib/supabase/client";
import type { DocumentRecord } from "@/lib/types";

export default function DocumentsSection({
  initialItems,
  expiringSoon,
}: {
  initialItems: DocumentRecord[];
  expiringSoon: DocumentRecord[];
}) {
  const supabase = createClient();

  if (!supabase) {
    return (
      <p className="text-sm text-red-500">
        Supabase isn&rsquo;t configured in this deployment.
      </p>
    );
  }

  return (
    <div>
      {expiringSoon.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          <strong>{expiringSoon.length}</strong> document
          {expiringSoon.length === 1 ? "" : "s"} expiring within 90 days:{" "}
          {expiringSoon.map((d) => d.title).join(", ")}
        </div>
      )}
      <GenericEditor
        config={DOCUMENT_CONFIG}
        initialItems={initialItems as unknown as Record<string, unknown>[]}
        supabase={supabase}
      />
    </div>
  );
}
