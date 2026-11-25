"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import Card from "../ui/Card";
import ChartTooltip, { type TooltipEntry } from "../ui/ChartTooltip";
import { formatBDT, formatCompactBDT } from "@/lib/chart-colors";
import { hueFor, initialsFor, logoKeyFor } from "@/lib/institution-logos";
import { DEPOSIT_INSURANCE_LIMIT, type InstitutionExposure } from "@/lib/finance-calc";

// Category tick: bank mark + single-line name (recharts' default wraps long names).
function NameTick(props: { x?: number; y?: number; payload?: { value: string } }) {
  const { x = 0, y = 0, payload } = props;
  const v = payload?.value ?? "";
  const key = logoKeyFor(v);
  const hue = hueFor(v);
  return (
    <g>
      <rect x={x - 152} y={y - 11} width={22} height={22} rx={6} fill={key ? "#fff" : `hsl(${hue} 70% 92%)`} stroke="var(--border)" />
      {key ? (
        <image href={`/logos/${key}.png`} x={x - 150} y={y - 9} width={18} height={18} preserveAspectRatio="xMidYMid meet" />
      ) : (
        <text x={x - 141} y={y} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={600} fill={`hsl(${hue} 55% 30%)`}>
          {initialsFor(v)}
        </text>
      )}
      <text x={x - 6} y={y} textAnchor="end" dominantBaseline="central" fill="var(--foreground)" fontSize={12}>
        {v.length > 14 ? `${v.slice(0, 13)}…` : v}
      </text>
    </g>
  );
}

export default function ExposureCard({
  rows,
  selected,
  onSelect,
}: {
  rows: InstitutionExposure[];
  selected: string | null;
  onSelect: (institution: string | null) => void;
}) {
  const height = Math.max(180, rows.length * 44 + 20);
  return (
    <Card
      title="Deposit exposure by institution"
      subtitle="FDR + DPS + Sanchaypatra — click a bar to drill in"
      delay={3}
    >
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 0, right: 84, left: 0, bottom: 0 }}
            barCategoryGap={8}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="institution"
              width={156}
              axisLine={false}
              tickLine={false}
              tick={<NameTick />}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-2)", opacity: 0.6 }}
              content={(p) => {
                const row = p.payload?.[0]?.payload as InstitutionExposure | undefined;
                return (
                  <ChartTooltip
                    active={p.active}
                    payload={p.payload as unknown as TooltipEntry[]}
                    label={row?.institution}
                    format={formatBDT}
                    footer={() =>
                      row ? (
                        <>
                          {row.pct.toFixed(1)}% of deposits ·{" "}
                          {row.overInsured > 0
                            ? `${formatBDT(row.overInsured)} above the ~${formatBDT(DEPOSIT_INSURANCE_LIMIT)} insured amount`
                            : "within the insured amount"}
                        </>
                      ) : null
                    }
                  />
                );
              }}
            />
            <Bar
              dataKey="amount"
              name="Balance"
              radius={[0, 6, 6, 0]}
              barSize={22}
              onClick={(d) => {
                const name = (d as unknown as InstitutionExposure).institution;
                onSelect(selected === name ? null : name);
              }}
              cursor="pointer"
              isAnimationActive={false}
            >
              {rows.map((r) => (
                <Cell
                  key={r.institution}
                  fill="var(--series-1)"
                  fillOpacity={selected && selected !== r.institution ? 0.3 : 1}
                />
              ))}
              <LabelList
                dataKey="amount"
                position="right"
                content={(p) => {
                  const { x = 0, y = 0, width = 0, height = 0, value } = p as {
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    value?: number;
                  };
                  return (
                    <text
                      x={Number(x) + Number(width) + 8}
                      y={Number(y) + Number(height) / 2}
                      dominantBaseline="central"
                      fill="var(--foreground)"
                      fontSize={12}
                      fontWeight={600}
                    >
                      {formatCompactBDT(Number(value) || 0)}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-muted">
        Deposit insurance covers roughly {formatBDT(DEPOSIT_INSURANCE_LIMIT)} per
        depositor per institution (approximate — confirm with Bangladesh
        Bank). Balances above that rely on the institution&rsquo;s own soundness.
      </p>
    </Card>
  );
}
