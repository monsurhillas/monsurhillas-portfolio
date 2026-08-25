"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "./icons";
import type { Profile } from "@/lib/types";

export default function Hero({ profile }: { profile: Profile }) {
  const socials = [
    { href: profile.linkedin_url, icon: LinkedinIcon, label: "LinkedIn" },
    { href: profile.github_url, icon: GithubIcon, label: "GitHub" },
    { href: profile.twitter_url, icon: XIcon, label: "Twitter" },
    { href: `mailto:${profile.email}`, icon: Mail, label: "Email" },
  ].filter((s) => !!s.href);

  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] items-center overflow-hidden"
    >
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--accent), transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--accent-2), transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div id="about" className="relative mx-auto w-full max-w-6xl px-6 py-24">
        <div className="grid items-center gap-14 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Open to new opportunities
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
            >
              {profile.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-4 text-xl font-medium text-gradient sm:text-2xl"
            >
              {profile.title}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-muted"
            >
              {profile.summary}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="#contact"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
              >
                Get in touch
              </a>
              <a
                href={profile.resume_url}
                download
                className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                <Download size={14} /> Download CV
              </a>

              {socials.length > 0 && (
                <div className="ml-1 flex items-center gap-1">
                  {socials.map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-accent"
                    >
                      <Icon size={17} />
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto aspect-square w-56 sm:w-72 md:w-full md:max-w-sm"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-accent to-accent-2 opacity-25 blur-xl" />
            <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-border bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        <motion.a
          href="#experience"
          aria-label="Scroll to experience"
          className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 items-center justify-center rounded-full border border-border p-2 text-muted sm:flex"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={16} />
        </motion.a>
      </div>
    </section>
  );
}
