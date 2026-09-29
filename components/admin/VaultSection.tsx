"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { encryptSecret, decryptSecret, type VaultSecret } from "@/lib/crypto";
import type { VaultCredential } from "@/lib/types";
import {
  VAULT_CATEGORIES,
  SOCIAL_PLATFORMS,
  PLATFORM_COLORS,
  vaultCategoryConfig,
  type VaultCategory,
} from "@/lib/vault-categories";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Save,
  Trash2,
  Pencil,
  Loader2,
  Copy,
  Check,
  Landmark,
  Share2,
  Mail,
  Briefcase,
  KeyRound,
} from "lucide-react";

type Row = VaultCredential;

const CATEGORY_ICONS = {
  share: Share2,
  landmark: Landmark,
  mail: Mail,
  briefcase: Briefcase,
  key: KeyRound,
} as const;

interface DraftForm {
  website: string;
  username: string;
  category: VaultCategory;
  platform: string;
  secret: Record<string, string>;
}

function emptyForm(category: VaultCategory = "Other"): DraftForm {
  const cfg = vaultCategoryConfig(category);
  const secret: Record<string, string> = {};
  for (const f of cfg.secretFields) secret[f.key] = "";
  return {
    website: "",
    username: "",
    category,
    platform: cfg.hasPlatform ? SOCIAL_PLATFORMS[0] : "",
    secret,
  };
}

export default function VaultSection({
  initialItems,
}: {
  initialItems: Row[];
}) {
  const supabase = createClient();
  const [items, setItems] = useState<Row[]>(initialItems);
  const [filter, setFilter] = useState<VaultCategory | "All">("All");

  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [passphraseInput, setPassphraseInput] = useState("");

  const [revealed, setRevealed] = useState<Record<string, VaultSecret>>({});
  const [visibleFields, setVisibleFields] = useState<Record<string, Set<string>>>(
    {}
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftForm>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) map.set(it.category, (map.get(it.category) ?? 0) + 1);
    return map;
  }, [items]);

  const visibleItems = useMemo(() => {
    return items
      .filter((it) => filter === "All" || it.category === filter)
      .slice()
      .sort((a, b) => a.website.localeCompare(b.website));
  }, [items, filter]);

  if (!supabase) {
    return (
      <p className="text-sm text-red-500">
        Supabase isn&rsquo;t configured in this deployment.
      </p>
    );
  }
  const client = supabase;

  function lockVault() {
    setPassphrase(null);
    setRevealed({});
    setVisibleFields({});
    setRevealError({});
    setEditingId(null);
    setAdding(false);
  }

  async function handleReveal(row: Row) {
    if (!passphrase) return;
    setBusyId(row.id);
    setRevealError((prev) => ({ ...prev, [row.id]: "" }));
    try {
      const secret = await decryptSecret(passphrase, {
        ciphertext: row.ciphertext,
        iv: row.iv,
        salt: row.salt,
      });
      setRevealed((prev) => ({ ...prev, [row.id]: secret }));
    } catch {
      setRevealError((prev) => ({
        ...prev,
        [row.id]: "Wrong passphrase, or this entry is corrupted.",
      }));
    } finally {
      setBusyId(null);
    }
  }

  function hideRevealed(id: string) {
    setRevealed((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setVisibleFields((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function toggleFieldVisible(rowId: string, key: string) {
    setVisibleFields((prev) => {
      const current = new Set(prev[rowId] ?? []);
      if (current.has(key)) current.delete(key);
      else current.add(key);
      return { ...prev, [rowId]: current };
    });
  }

  async function copyValue(rowId: string, key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(`${rowId}:${key}`);
      setTimeout(() => setCopiedKey((k) => (k === `${rowId}:${key}` ? null : k)), 1500);
    } catch {
      // Clipboard API may be unavailable; silently ignore.
    }
  }

  function startAdd() {
    setForm(emptyForm());
    setFormError(null);
    setEditingId(null);
    setAdding(true);
  }

  async function startEdit(row: Row) {
    if (!passphrase) return;
    setBusyId(row.id);
    try {
      const secret = await decryptSecret(passphrase, {
        ciphertext: row.ciphertext,
        iv: row.iv,
        salt: row.salt,
      });
      const category = (row.category as VaultCategory) || "Other";
      const cfg = vaultCategoryConfig(category);
      const merged: Record<string, string> = {};
      for (const f of cfg.secretFields) merged[f.key] = secret[f.key] ?? "";
      setForm({
        website: row.website,
        username: row.username,
        category,
        platform: row.platform ?? (cfg.hasPlatform ? SOCIAL_PLATFORMS[0] : ""),
        secret: merged,
      });
      setFormError(null);
      setAdding(false);
      setEditingId(row.id);
    } catch {
      setRevealError((prev) => ({
        ...prev,
        [row.id]: "Wrong passphrase — can't edit without decrypting first.",
      }));
    } finally {
      setBusyId(null);
    }
  }

  function cancelForm() {
    setAdding(false);
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
  }

  function changeCategory(category: VaultCategory) {
    setForm((f) => {
      const cfg = vaultCategoryConfig(category);
      const secret: Record<string, string> = {};
      for (const field of cfg.secretFields) {
        secret[field.key] = f.secret[field.key] ?? "";
      }
      return {
        ...f,
        category,
        platform: cfg.hasPlatform ? f.platform || SOCIAL_PLATFORMS[0] : "",
        secret,
      };
    });
  }

  async function handleSubmit() {
    if (!passphrase) return;
    const cfg = vaultCategoryConfig(form.category);
    if (!form.website.trim()) {
      setFormError(`${cfg.labelField.label} is required.`);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const encrypted = await encryptSecret(passphrase, form.secret);
      const payload = {
        website: form.website.trim(),
        username: form.username.trim(),
        category: form.category,
        platform: cfg.hasPlatform ? form.platform : null,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        salt: encrypted.salt,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { data, error } = await client
          .from("vault_credentials")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();
        if (error) throw error;
        setItems((prev) =>
          prev.map((it) => (it.id === editingId ? (data as Row) : it))
        );
        hideRevealed(editingId);
      } else {
        const { data, error } = await client
          .from("vault_credentials")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setItems((prev) => [...prev, data as Row]);
      }
      cancelForm();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this credential? This can't be undone.")) return;
    setBusyId(id);
    const { error } = await client
      .from("vault_credentials")
      .delete()
      .eq("id", id);
    setBusyId(null);
    if (error) {
      alert(error.message);
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  if (!passphrase) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Lock size={18} />
        </div>
        <h2 className="mt-3 text-lg font-semibold">Unlock your vault</h2>
        <p className="mt-1 text-sm text-muted">
          Enter your master passphrase. It&rsquo;s used only in your browser
          to encrypt and decrypt entries — it&rsquo;s never sent to the
          server. There is no recovery if you forget it, so keep it
          somewhere safe.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (passphraseInput) setPassphrase(passphraseInput);
          }}
          className="mt-5 flex flex-col gap-3"
        >
          <input
            type="password"
            autoFocus
            value={passphraseInput}
            onChange={(e) => setPassphraseInput(e.target.value)}
            placeholder="Master passphrase"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={!passphraseInput}
            className="flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            <Unlock size={14} /> Unlock
          </button>
        </form>
        {items.length === 0 && (
          <p className="mt-4 text-xs text-muted">
            No entries yet — once unlocked, this same passphrase will be
            used to encrypt anything you add. Use the same passphrase every
            time; a different one won&rsquo;t decrypt older entries.
          </p>
        )}
      </div>
    );
  }

  const formCfg = vaultCategoryConfig(form.category);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={lockVault}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium"
        >
          <Lock size={14} /> Lock vault
        </button>
        <button
          onClick={startAdd}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={14} /> Add credential
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {(["All", ...VAULT_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === c
                ? "bg-accent text-white"
                : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            {c}
            {c !== "All" && counts.get(c) ? (
              <span className="ml-1 opacity-70">({counts.get(c)})</span>
            ) : null}
          </button>
        ))}
      </div>

      {(adding || editingId) && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">
            {editingId ? "Edit credential" : "New credential"}
          </h3>
          {formError && (
            <p className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-500">
              {formError}
            </p>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {VAULT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => changeCategory(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.category === c
                      ? "bg-accent text-white"
                      : "bg-surface-2 text-muted hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                {formCfg.labelField.label}
              </label>
              <input
                type="text"
                value={form.website}
                onChange={(e) =>
                  setForm((f) => ({ ...f, website: e.target.value }))
                }
                placeholder={formCfg.labelField.placeholder}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            {formCfg.hasPlatform && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Platform
                </label>
                <select
                  value={form.platform}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, platform: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                {formCfg.usernameField.label}
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                placeholder={formCfg.usernameField.placeholder}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            {formCfg.secretFields.map((sf) => (
              <div
                key={sf.key}
                className={sf.type === "textarea" ? "sm:col-span-2" : ""}
              >
                <label className="mb-1 block text-xs font-medium text-muted">
                  {sf.label}
                  {sf.optional && (
                    <span className="ml-1 text-muted/70">(optional)</span>
                  )}
                </label>
                {sf.type === "textarea" ? (
                  <textarea
                    rows={2}
                    value={form.secret[sf.key] ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        secret: { ...f.secret, [sf.key]: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                ) : (
                  <input
                    type="text"
                    value={form.secret[sf.key] ?? ""}
                    placeholder={sf.placeholder}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        secret: { ...f.secret, [sf.key]: e.target.value },
                      }))
                    }
                    className={`w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent ${
                      sf.type === "password" ? "font-mono" : ""
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleSubmit}
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
              onClick={cancelForm}
              className="rounded-full border border-border px-4 py-2 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {visibleItems.length === 0 && (
          <p className="text-sm text-muted">
            {items.length === 0
              ? 'No credentials yet. Click "Add credential" to store your first one.'
              : "No credentials in this category."}
          </p>
        )}
        {visibleItems.map((row) => {
          const secret = revealed[row.id];
          const err = revealError[row.id];
          const busy = busyId === row.id;
          const category = (row.category as VaultCategory) || "Other";
          const cfg = vaultCategoryConfig(category);
          const Icon = CATEGORY_ICONS[cfg.icon];
          const shownFields = visibleFields[row.id] ?? new Set<string>();
          return (
            <div
              key={row.id}
              className="rounded-xl border border-border bg-surface p-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-medium">
                        {row.website}
                      </span>
                      {row.platform && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                PLATFORM_COLORS[row.platform] ?? "#8b8b8b",
                            }}
                          />
                          {row.platform}
                        </span>
                      )}
                      <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                        {row.category}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted">
                      {row.username || "—"}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {secret ? (
                    <button
                      onClick={() => hideRevealed(row.id)}
                      title="Hide"
                      className="rounded-full border border-border p-2 text-muted hover:text-foreground"
                    >
                      <EyeOff size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReveal(row)}
                      disabled={busy}
                      title="Reveal"
                      className="rounded-full border border-border p-2 text-muted hover:text-foreground disabled:opacity-60"
                    >
                      {busy ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(row)}
                    disabled={busy}
                    title="Edit"
                    className="rounded-full border border-border p-2 text-muted hover:text-foreground disabled:opacity-60"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    disabled={busy}
                    title="Delete"
                    className="rounded-full border border-border p-2 text-red-500 hover:border-red-500/50 disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {secret && (
                <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {cfg.secretFields.map((sf) => {
                    const value = secret[sf.key] ?? "";
                    if (!value && sf.optional) return null;
                    const isSensitive = sf.type === "password";
                    const fieldShown = !isSensitive || shownFields.has(sf.key);
                    const copyId = `${row.id}:${sf.key}`;
                    return (
                      <div
                        key={sf.key}
                        className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-3 py-1.5"
                      >
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wide text-muted">
                            {sf.label}
                          </div>
                          <div
                            className={`truncate text-sm ${
                              isSensitive ? "font-mono" : ""
                            }`}
                          >
                            {value ? (
                              fieldShown ? (
                                value
                              ) : (
                                "•".repeat(Math.min(value.length, 12))
                              )
                            ) : (
                              <span className="text-muted">
                                (not set)
                              </span>
                            )}
                          </div>
                        </div>
                        {value && (
                          <div className="flex shrink-0 items-center gap-0.5">
                            {isSensitive && (
                              <button
                                onClick={() =>
                                  toggleFieldVisible(row.id, sf.key)
                                }
                                title={fieldShown ? "Hide" : "Show"}
                                className="rounded-full p-1.5 text-muted hover:text-foreground"
                              >
                                {fieldShown ? (
                                  <EyeOff size={12} />
                                ) : (
                                  <Eye size={12} />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => copyValue(row.id, sf.key, value)}
                              title="Copy"
                              className="rounded-full p-1.5 text-muted hover:text-foreground"
                            >
                              {copiedKey === copyId ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {err && <p className="mt-2 text-xs text-red-500">{err}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
