import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import { GraduationCap } from "lucide-react";
import type { EducationItem } from "@/lib/types";

export default function Education({ items }: { items: EducationItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="education" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Academics" title="Education" />
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={Math.min(i * 0.08, 0.3)}>
            <div className="flex h-full gap-4 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/50">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="font-semibold leading-snug">{item.degree}</h3>
                <p className="mt-1 text-sm text-accent">{item.institution}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted">
                  {item.date}
                </p>
                {item.detail && (
                  <p className="mt-1 text-sm text-muted">{item.detail}</p>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
