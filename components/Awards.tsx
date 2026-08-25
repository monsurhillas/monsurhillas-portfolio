import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import { Award } from "lucide-react";
import type { AwardItem } from "@/lib/types";

export default function Awards({ items }: { items: AwardItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="awards" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Recognition" title="Awards" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={Math.min(i * 0.07, 0.3)}>
            <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/50">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Award size={20} />
              </div>
              <h3 className="mt-4 font-semibold leading-snug">{item.title}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
                {item.issuer}
                {item.date ? ` · ${item.date}` : ""}
              </p>
              {item.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
