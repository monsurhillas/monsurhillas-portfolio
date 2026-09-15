# MD Monsur Hillas — Portfolio

Personal portfolio site, built with Next.js (App Router), Tailwind CSS, and
framer-motion, with a Supabase-backed CRUD admin panel for editing content
and Google OAuth restricted to a single account.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** for styling, **framer-motion** for animation
- **Supabase** — Postgres database for all site content + Auth (Google
  OAuth) for the admin panel
- **Vercel** for hosting

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content model

All site content (profile, experience, education, skills, awards, projects,
research) lives in Supabase tables defined in `supabase/schema.sql`. That
file also seeds the tables with content from the current CV and sets up Row
Level Security so that:

- Anyone can **read** content (the public site).
- Only a session whose Google account email matches `hillasmonsur@gmail.com`
  can **write** (insert/update/delete) — enforced by Postgres RLS policies,
  not just app-level checks.

If `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` aren't set,
the site falls back to the static seed data in `lib/seed-data.ts` so it
still renders correctly.

## Editing content

Sign in at `/admin` with the Google account `hillasmonsur@gmail.com` for a
sidebar of admin sections, each restricted to that one account both in the
UI and in the database (Row Level Security):

- **Portfolio Update** — the public site's content (profile, experience,
  education, skills, awards, projects, research) through a CRUD UI.
- **Jobs** — a tracker for bank/data/product roles in Dhaka, combining a
  daily automated fetch (JSearch API, via a Vercel Cron job) with a manual
  "Add job" button for links found elsewhere.
- **Finances** — DPS/FDR/SIP/lumpsum/mutual fund holdings, plus an
  analytical dashboard (total value, breakdown by type, upcoming
  maturities with estimated payouts).
- **Password Vault** — logins encrypted in the browser (PBKDF2 + AES-GCM)
  with a master passphrase that's never sent to the server; passwords stay
  hidden until you click to reveal one.
- **Expenses** — a daily spend tracker with monthly totals and a
  category breakdown.
- **Documents** — metadata (reference numbers, expiry dates) for NID,
  passport, certificates, and policies — no files are uploaded.
- **Net Worth & Goals** — periodic net-worth snapshots charted over time,
  plus savings goals with progress bars.

Unlike the public content tables, the Jobs/Finances/Vault/Expenses/
Documents/Net-Worth tables have **no public-read policy at all** — only the
admin's own authenticated session can read or write them.

## Environment variables (set in Vercel → Project → Settings → Environment
Variables, and see `.env.local.example` for local dev)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, `JSEARCH_API_KEY`, `CRON_SECRET` — optional,
  only needed for the Jobs section's automated daily fetch (see
  `SETUP_GUIDE.md` step 4). The rest of the admin panel works without them.

Google sign-in itself is configured in the Supabase dashboard (Authentication
→ Providers → Google), not as an app environment variable — see the setup
guide provided alongside this repo.

## Deploying

Push to `main` and import this repo into [Vercel](https://vercel.com/new).
Set the two environment variables above, and set the project name to
`monsurhillas` so the assigned domain is `monsurhillas.vercel.app`.
