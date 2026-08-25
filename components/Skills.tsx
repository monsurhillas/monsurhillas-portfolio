import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import type { SkillGroup } from "@/lib/types";

export default function Skills({ groups }: { groups: SkillGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Toolkit" title="Skills" />
      <div className="grid gap-5 sm:grid-cols-2">
        {groups.map((g, i) => (
          <Reveal key={g.id} delay={Math.min(i * 0.07, 0.3)}>
            <div className="h-full rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/50">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">
                {g.category}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
