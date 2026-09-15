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
