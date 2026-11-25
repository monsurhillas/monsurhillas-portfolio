import { hueFor, initialsFor, logoKeyFor } from "@/lib/institution-logos";

/** Bank / AMC mark in a small white tile; coloured initials when no logo is bundled. */
export default function InstitutionLogo({
  name,
  size = 28,
  className = "",
}: {
  name: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const key = logoKeyFor(name);
  const box = { width: size, height: size };
  if (key) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white ${className}`}
        style={box}
        title={name ?? undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/logos/${key}.png`} alt={name ?? ""} width={size} height={size} loading="lazy" className="h-full w-full object-contain" />
      </span>
    );
  }
  const hue = hueFor(name);
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold ${className}`}
      style={{
        ...box,
        fontSize: Math.max(9, Math.round(size * 0.36)),
        background: `hsl(${hue} 70% 92%)`,
        color: `hsl(${hue} 55% 30%)`,
      }}
      title={name ?? undefined}
    >
      {initialsFor(name)}
    </span>
  );
}
