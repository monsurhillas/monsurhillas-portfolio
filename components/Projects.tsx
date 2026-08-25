import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import { ExternalLink, Sparkles } from "lucide-react";
import type { ProjectItem } from "@/lib/types";

export default function Projects({ items }: { items: ProjectItem[] }) {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Selected Work" title="Projects" />

      {items.length === 0 ? (
        <Reveal>
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <Sparkles className="text-accent" size={22} />
            <p className="font-medium">More projects coming soon</p>
            <p className="max-w-sm text-sm text-muted">
              This section is ready to go — sign in to the admin panel to add
              projects here any time.
            </p>
          </div>
        </Reveal>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i * 0.07, 0.3)}>
              <a
                href={item.link ?? undefined}
                target={item.link ? "_blank" : undefined}
                rel="noreferrer"
                className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent/50 ${
                  item.link ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug">
                      {item.title}
                    </h3>
                    {item.link && (
                      <ExternalLink
                        size={16}
                        className="mt-0.5 flex-shrink-0 text-muted transition-colors group-hover:text-accent"
                      />
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  )}
                  {item.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
