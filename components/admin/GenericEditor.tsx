"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Plus, Save, Trash2, Loader2 } from "lucide-react";
import type { TableConfig } from "@/lib/admin-fields";

type Row = Record<string, unknown> & { id?: string };

function toListString(value: unknown): string {
  return Array.isArray(value) ? value.join("\n") : "";
}

function fromListString(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function GenericEditor({
  config,
  initialItems,
  supabase,
}: {
  config: TableConfig;
  initialItems: Row[];
  supabase: SupabaseClient;
}) {
  const [items, setItems] = useState<Row[]>(initialItems);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(
    {}
  );

  function draftFor(item: Row): Record<string, string> {
    const key = item.id as string;
    if (drafts[key]) return drafts[key];
    const d: Record<string, string> = {};
    for (const f of config.fields) {
      d[f.key] =
        f.type === "list" ? toListString(item[f.key]) : String(item[f.key] ?? "");
    }
    return d;
  }

  function setDraftField(id: string, key: string, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...draftFor({ id, ...items.find((i) => i.id === id) }), [key]: value },
    }));
  }

  async function handleSave(item: Row) {
    const id = item.id as string;
    const d = draftFor(item);
    setSavingId(id);
    setError(null);

    const payload: Record<string, unknown> = {};
    for (const f of config.fields) {
      if (f.type === "list") payload[f.key] = fromListString(d[f.key] ?? "");
      else if (f.key === "sort_order") payload[f.key] = Number(d[f.key]) || 0;
      else payload[f.key] = d[f.key] ?? "";
    }

    const { error } = await supabase
      .from(config.table)
      .update(payload)
      .eq("id", id);

    setSavingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...payload } : it)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item? This can't be undone.")) return;
    setSavingId(id);
    const { error } = await supabase.from(config.table).delete().eq("id", id);
    setSavingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function handleAdd() {
    setError(null);
    const { data, error } = await supabase
      .from(config.table)
      .insert(config.emptyItem)
      .select()
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => [...prev, data as Row]);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{config.title}</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={14} /> Add {config.singular}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-muted">
            No {config.title.toLowerCase()} yet. Click &ldquo;Add{" "}
            {config.singular}&rdquo; to create one.
          </p>
        )}

        {items.map((item) => {
          const id = item.id as string;
          const d = draftFor(item);
          const saving = savingId === id;
          return (
            <div
              key={id}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {config.fields.map((f) => (
                  <div
                    key={f.key}
                    className={
                      f.type === "textarea" || f.type === "list"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <label className="mb-1 block text-xs font-medium text-muted">
                      {f.label}
                    </label>
                    {f.type === "textarea" || f.type === "list" ? (
                      <textarea
                        rows={f.type === "list" ? 4 : 3}
                        value={d[f.key] ?? ""}
                        placeholder={f.placeholder}
                        onChange={(e) =>
                          setDraftField(id, f.key, e.target.value)
                        }
                        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    ) : (
                      <input
                        type="text"
                        value={d[f.key] ?? ""}
                        placeholder={f.placeholder}
                        onChange={(e) =>
                          setDraftField(id, f.key, e.target.value)
                        }
                        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => handleSave(item)}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  Save
                </button>
                <button
                  onClick={() => handleDelete(id)}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-red-500 hover:border-red-500/50 disabled:opacity-60"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
