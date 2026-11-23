import type { CSSProperties, ReactNode } from "react";

// The standard surface for every block in the admin: glass card with an
// optional title row (title, subtitle, right-aligned action) and staggered
// entrance animation (`delay` is the stagger index).
export default function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  delay = 0,
  hero = false,
  padded = true,
  fill = false,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
  hero?: boolean;
  padded?: boolean;
  fill?: boolean;
}) {
  const style: CSSProperties = { animationDelay: `${delay * 60}ms` };
  return (
    <section
      style={style}
      className={`card reveal ${hero ? "hero" : ""} ${fill ? "flex h-full flex-col" : ""} ${className}`}
    >
      {(title || action) && (
        <header
          className={`relative flex flex-wrap items-start justify-between gap-3 ${
            padded ? "px-5 pt-5" : "px-5 pt-5 pb-3"
          }`}
        >
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={`relative ${fill ? "flex-1" : ""} ${padded ? "p-5" : ""} ${title || action ? (padded ? "pt-4" : "") : ""}`}>
        {children}
      </div>
    </section>
  );
}
