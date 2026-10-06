"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Plus, Save, Trash2, Loader2, ChevronDown } from "lucide-react";
import type { FieldConfig, TableConfig } from "@/lib/admin-fields";

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

const STATUS_COLORS: Record<string, string> = {
  Interested: "bg-surface-2 text-muted",
  Applied: "bg-blue-500/10 text-blue-500",
  Interview: "bg-amber-500/10 text-amber-500",
  Offer: "bg-emerald-500/10 text-emerald-500",
  Rejected: "bg-red-500/10 text-red-500",
};

function fieldValueText(item: Row, f?: FieldConfig): string {
  if (!f) return "";
  const v = item[f.key];
  if (Array.isArray(v)) return v.join(", ");
  return v === null || v === undefined || v === "" ? "" : String(v);
}

function summarize(
  item: Row,
  config: TableConfig
): { primary: string; secondary?: string } {
  if (config.summary) {
    try {
      return config.summary(item);
    } catch {
      // fall through to the generic fallback below
    }
  }
  const primary = fieldValueText(item, config.fields[0]) || `Untitled ${config.singular}`;
  const secondary = fieldValueText(item, config.fields[1]);
  return { primary, secondary: secondary || undefined };
}

export default function GenericEditor({
  config,
  initialItems,
  supabase,
  onItemsChange,
}: {
  config: TableConfig;
  initialItems: Row[];
  supabase: SupabaseClient;
  // Lets a parent (e.g. a dashboard) mirror edits made in this list.
  onItemsChange?: (items: Row[]) => void;
}) {
  const [items, setItems] = useState<Row[]>(initialItems);

  useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(
    {}
  );

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function draftFor(item: Row): Record<string, string> {
    const key = item.id as string;
    if (drafts[key]) return drafts[key];
    const d: Record<string, string> = {};
    for (const f of config.fields) {
      d[f.key] =
        f.type === "list"
          ? toListString(item[f.key])
          : f.type === "boolean"
            ? item[f.key]
              ? "true"
              : "false"
            : item[f.key] === null || item[f.key] === undefined
            ? ""
            : String(item[f.key]);
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
      const raw = d[f.key] ?? "";
      if (f.type === "list") payload[f.key] = fromListString(raw);
      else if (f.type === "boolean") payload[f.key] = raw === "true";
      else if (f.key === "sort_order") payload[f.key] = Number(raw) || 0;
      else if (f.type === "number")
        payload[f.key] = raw === "" && f.nullable ? null : Number(raw) || 0;
      else if (f.type === "date") payload[f.key] = raw === "" ? null : raw;
      else payload[f.key] = raw;
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
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
    const row = data as Row;
    setItems((prev) => [...prev, row]);
    setExpanded((prev) => new Set(prev).add(row.id as string));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{config.title}</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={14} /> Add {config.singular}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="space-y-2">
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
          const isOpen = expanded.has(id);
          const { primary, secondary } = summarize(item, config);
          return (
            <div
              key={id}
              className="overflow-hidden rounded-xl border border-border bg-surface transition-colors"
            >
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  onClick={() => toggleExpanded(id)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                >
                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-muted transition-transform ${
                      isOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {primary}
                      </span>
                      {config.table === "jobs" && d.status && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            STATUS_COLORS[d.status] ?? STATUS_COLORS.Interested
                          }`}
                        >
                          {d.status}
                        </span>
                      )}
                    </span>
                    {secondary && (
                      <span className="block truncate text-xs text-muted">
                        {secondary}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(id)}
                  disabled={saving}
                  title="Delete"
                  className="shrink-0 rounded-full p-1.5 text-muted hover:bg-red-500/10 hover:text-red-500 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-border px-4 pb-4 pt-4">
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
                        ) : f.type === "boolean" ? (
                          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm">
                            <input
                              type="checkbox"
                              checked={d[f.key] === "true"}
                              onChange={(e) =>
                                setDraftField(
                                  id,
                                  f.key,
                                  e.target.checked ? "true" : "false"
                                )
                              }
                              className="h-4 w-4"
                              style={{ accentColor: "var(--accent)" }}
                            />
                            <span className="text-muted">
                              {d[f.key] === "true" ? "Yes" : "No"}
                            </span>
                          </label>
                        ) : f.type === "select" ? (
                          <select
                            value={d[f.key] ?? ""}
                            onChange={(e) =>
                              setDraftField(id, f.key, e.target.value)
                            }
                            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                          >
                            {(f.options ?? []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={
                              f.type === "number"
                                ? "number"
                                : f.type === "date"
                                  ? "date"
                                  : "text"
                            }
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
                      onClick={() => toggleExpanded(id)}
                      className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted hover:text-foreground"
                    >
                      Collapse
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
