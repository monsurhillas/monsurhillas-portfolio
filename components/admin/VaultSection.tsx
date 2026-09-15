"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { encryptSecret, decryptSecret, type VaultSecret } from "@/lib/crypto";
import type { VaultCredential } from "@/lib/types";
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
} from "lucide-react";

const CATEGORIES = ["Banking", "Email", "Work", "Social", "Other"];

type Row = VaultCredential;

interface DraftForm {
  website: string;
  username: string;
  category: string;
  password: string;
  notes: string;
}

const EMPTY_FORM: DraftForm = {
  website: "",
  username: "",
  category: "Other",
  password: "",
  notes: "",
};

export default function VaultSection({
  initialItems,
}: {
  initialItems: Row[];
}) {
  const supabase = createClient();
  const [items, setItems] = useState<Row[]>(initialItems);

  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [passphraseInput, setPassphraseInput] = useState("");

  const [revealed, setRevealed] = useState<Record<string, VaultSecret>>({});
  const [revealError, setRevealError] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
  }

  function startAdd() {
    setForm(EMPTY_FORM);
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
      setForm({
        website: row.website,
        username: row.username,
        category: row.category,
        password: secret.password,
        notes: secret.notes,
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
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  async function handleSubmit() {
    if (!passphrase) return;
    if (!form.website.trim()) {
      setFormError("Website is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const encrypted = await encryptSecret(passphrase, {
        password: form.password,
        notes: form.notes,
      });
      const payload = {
        website: form.website.trim(),
        username: form.username.trim(),
        category: form.category,
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

  async function copyPassword(row: Row) {
    const secret = revealed[row.id];
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret.password);
    } catch {
      // Clipboard API may be unavailable; silently ignore.
    }
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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Website
              </label>
              <input
                type="text"
                value={form.website}
                onChange={(e) =>
                  setForm((f) => ({ ...f, website: e.target.value }))
                }
                placeholder="e.g. gmail.com"
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Username / email
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Password
              </label>
              <input
                type="text"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono outline-none focus:border-accent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">
                Notes (optional)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
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

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted">
            No credentials yet. Click &ldquo;Add credential&rdquo; to store
            your first one.
          </p>
        )}
        {items
          .slice()
          .sort((a, b) => a.website.localeCompare(b.website))
          .map((row) => {
            const secret = revealed[row.id];
            const err = revealError[row.id];
            const busy = busyId === row.id;
            return (
              <div
                key={row.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        {row.website}
                      </span>
                      <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                        {row.category}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted">
                      {row.username || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {secret ? (
                      <>
                        <button
                          onClick={() => copyPassword(row)}
                          title="Copy password"
                          className="rounded-full border border-border p-2 text-muted hover:text-foreground"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => hideRevealed(row.id)}
                          title="Hide"
                          className="rounded-full border border-border p-2 text-muted hover:text-foreground"
                        >
                          <EyeOff size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleReveal(row)}
                        disabled={busy}
                        title="Reveal password"
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
                  <div className="mt-3 rounded-lg bg-surface-2 px-3 py-2 font-mono text-sm">
                    {secret.password || (
                      <span className="text-muted">(no password saved)</span>
                    )}
                    {secret.notes && (
                      <div className="mt-1 font-sans text-xs text-muted">
                        {secret.notes}
                      </div>
                    )}
                  </div>
                )}
                {err && (
                  <p className="mt-2 text-xs text-red-500">{err}</p>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
