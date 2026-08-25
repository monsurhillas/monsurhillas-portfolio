import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import type { ExperienceItem } from "@/lib/types";

function formatRange(start: string, end: string | null) {
  return `${start} — ${end && end.trim() ? end : "Present"}`;
}

export default function Experience({ items }: { items: ExperienceItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Career" title="Experience" />

      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border sm:left-[9px]" />
        <div className="space-y-10">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i * 0.06, 0.3)}>
              <div className="relative pl-8 sm:pl-10">
                <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-accent bg-background sm:h-5 sm:w-5" />
                <div className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/50">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-lg font-semibold">{item.role}</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted">
                      {formatRange(item.start_date, item.end_date)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-accent">
                    {item.company}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {item.bullets.map((b, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2.5 text-sm leading-relaxed text-muted"
                      >
                        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
