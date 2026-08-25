import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import { BookOpen, ExternalLink } from "lucide-react";
import type { ResearchItem } from "@/lib/types";

export default function Research({ items }: { items: ResearchItem[] }) {
  return (
    <section id="research" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Publications" title="Research" />

      {items.length === 0 ? (
        <Reveal>
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <BookOpen className="text-accent" size={22} />
            <p className="font-medium">Nothing published here yet</p>
            <p className="max-w-sm text-sm text-muted">
              Papers, whitepapers, or write-ups can be added here through the
              admin panel whenever they&rsquo;re ready.
            </p>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i * 0.06, 0.3)}>
              <a
                href={item.link ?? undefined}
                target={item.link ? "_blank" : undefined}
                rel="noreferrer"
                className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/50"
              >
                <div>
                  <h3 className="font-semibold leading-snug">{item.title}</h3>
                  {item.date && (
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
                      {item.date}
                    </p>
                  )}
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.link && (
                  <ExternalLink
                    size={16}
                    className="mt-1 flex-shrink-0 text-muted transition-colors group-hover:text-accent"
                  />
                )}
              </a>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
