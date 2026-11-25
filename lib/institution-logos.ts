// Maps an institution / fund name (as typed in the finance editor) to a bundled
// logo. Matching is forgiving: "Brac Bank PLC", "BRAC Bank Limited" and
// "brac" all resolve to the same logo. Unknown names return null and the UI
// falls back to a coloured initials badge.

export type LogoKey = "brac" | "ebl" | "idlc" | "ucb" | "city" | "edge" | "vipb" | "ekush";

const RULES: [LogoKey, RegExp][] = [
  ["brac", /\bbrac\b/],
  ["ebl", /\beastern\b|\bebl\b/],
  ["idlc", /\bidlc\b/],
  ["ucb", /united commercial|\bucb\b/],
  ["city", /\bcity bank\b|\bthe city\b/],
  ["edge", /\bedge\b/],
  ["vipb", /\bvipb\b/],
  ["ekush", /\bekush\b/],
];

export function logoKeyFor(name: string | null | undefined): LogoKey | null {
  const n = (name ?? "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
  for (const [key, re] of RULES) if (re.test(n)) return key;
  return null;
}

/** Up to two initials, ignoring filler words ("The", "Bank", "Limited"…). */
export function initialsFor(name: string | null | undefined): string {
  const words = (name ?? "")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !/^(the|bank|limited|ltd|plc|pvt|of|and|fund|asset|management)$/i.test(w));
  if (words.length === 0) return (name ?? "?").slice(0, 1).toUpperCase() || "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Stable pastel hue for the fallback badge, derived from the name. */
export function hueFor(name: string | null | undefined): number {
  let h = 0;
  for (const c of name ?? "") h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}
