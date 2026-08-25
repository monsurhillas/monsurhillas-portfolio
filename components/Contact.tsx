import { Mail, MapPin, Phone } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import { GithubIcon, LinkedinIcon, XIcon } from "./icons";
import type { Profile } from "@/lib/types";

export default function Contact({ profile }: { profile: Profile }) {
  const socials = [
    { href: profile.linkedin_url, icon: LinkedinIcon, label: "LinkedIn" },
    { href: profile.github_url, icon: GithubIcon, label: "GitHub" },
    { href: profile.twitter_url, icon: XIcon, label: "Twitter" },
  ].filter((s) => !!s.href);

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Let's talk" title="Contact" />
      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="grid gap-8 p-8 sm:grid-cols-2 sm:p-12">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">
                Have an opportunity or just want to connect?
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                I&rsquo;m always happy to talk portfolio strategy, structured
                credit, or data-driven product decisions. Reach out any of
                these ways.
              </p>
              {socials.length > 0 && (
                <div className="mt-6 flex items-center gap-2">
                  {socials.map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <Icon size={17} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-4">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3.5 text-sm transition-colors hover:border-accent"
              >
                <Mail size={17} className="text-accent" />
                {profile.email}
              </a>
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3.5 text-sm transition-colors hover:border-accent"
                >
                  <Phone size={17} className="text-accent" />
                  {profile.phone}
                </a>
              )}
              {profile.location && (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3.5 text-sm">
                  <MapPin size={17} className="text-accent" />
                  {profile.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
