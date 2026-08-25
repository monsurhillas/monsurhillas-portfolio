"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Save, Loader2 } from "lucide-react";
import type { Profile } from "@/lib/types";

const FIELDS: { key: keyof Profile; label: string; type?: "textarea" }[] = [
  { key: "name", label: "Name" },
  { key: "title", label: "Title" },
  { key: "summary", label: "Summary", type: "textarea" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "photo_url", label: "Photo URL" },
  { key: "resume_url", label: "Resume URL" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "github_url", label: "GitHub URL" },
  { key: "twitter_url", label: "Twitter/X URL" },
];

export default function ProfileEditor({
  initial,
  supabase,
}: {
  initial: Profile;
  supabase: SupabaseClient;
}) {
  const [draft, setDraft] = useState<Profile>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const { id: _id, ...rest } = draft;
    void _id;
    const { error } = await supabase.from("profile").update(rest).eq("id", 1);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Profile</h2>
      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {error}
        </p>
      )}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div
              key={f.key}
              className={f.type === "textarea" ? "sm:col-span-2" : ""}
            >
              <label className="mb-1 block text-xs font-medium text-muted">
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  rows={4}
                  value={draft[f.key] ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              ) : (
                <input
                  type="text"
                  value={draft[f.key] ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            Save profile
          </button>
          {saved && (
            <span className="text-xs font-medium text-emerald-500">
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
