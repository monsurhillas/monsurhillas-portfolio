// A small categorical palette for charts (breakdowns by category/type),
// chosen to read clearly on both the light and dark theme surfaces used
// across the admin dashboard.
export const CHART_PALETTE = [
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#0ea5e9", // sky
  "#f97316", // orange
  "#84cc16", // lime
  "#ec4899", // pink
];

export function colorForIndex(i: number): string {
  return CHART_PALETTE[i % CHART_PALETTE.length];
}

export function formatBDT(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
}

// Compact Bangladeshi-style amounts: 1,00,000 = 1 lakh (L), 1,00,00,000 = 1 crore (Cr).
export function formatCompactBDT(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}${(abs / 100000).toFixed(2)} L`;
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}k`;
  return `${sign}${Math.round(abs)}`;
}

// Entity → categorical slot. Color follows the entity (never its rank), so a
// filter that hides a type never repaints the others. Slots come from the
// validated palette defined as --series-N in app/admin/admin.css.
export const TYPE_SERIES: Record<string, number> = {
  FDR: 1,
  Sanchaypatra: 2,
  DPS: 3,
  "Mutual Fund": 4,
  SIP: 5,
  Lumpsum: 6,
  Other: 7,
};

export function typeColor(type: string): string {
  return `var(--series-${TYPE_SERIES[type] ?? 7})`;
}
