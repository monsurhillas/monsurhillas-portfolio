# Finishing setup: Google sign-in + going live

Everything code-related is done and pushed. Three manual steps are left,
all of them one-time account setup that has to happen in *your* Google
Cloud and Vercel accounts — I can't click through OAuth consent screens or
paste secrets into a dashboard on your behalf.

## 1. Create a Google OAuth Client (Google Cloud Console)

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   create a new project (or pick an existing one) — name it anything, e.g.
   "monsurhillas-portfolio".
2. In the left sidebar: **APIs & Services → OAuth consent screen**.
   - User type: **External**.
   - Fill in an app name (e.g. "Monsur Hillas Portfolio"), your support
     email (`hillasmonsur@gmail.com`), and developer contact email.
   - You can leave scopes at the default and publish the app (or leave it
     in "Testing" mode and add `hillasmonsur@gmail.com` as a test user —
     either works since you're the only person who will ever sign in).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Name: anything.
   - **Authorized redirect URIs** — add exactly this (replace
     `<project-ref>` with your Supabase project ref, `dxrwiuvfccsydmhunzgx`):
     ```
     https://dxrwiuvfccsydmhunzgx.supabase.co/auth/v1/callback
     ```
   - Click **Create**. You'll get a **Client ID** and **Client Secret** —
     copy both.

## 2. Enable Google sign-in in Supabase

1. Open your project at
   [supabase.com/dashboard/project/dxrwiuvfccsydmhunzgx](https://supabase.com/dashboard/project/dxrwiuvfccsydmhunzgx).
2. Go to **Authentication → Sign In / Providers → Google**.
3. Toggle it **on**, paste the **Client ID** and **Client Secret** from
   step 1, and save.
4. Still in **Authentication → URL Configuration**, set:
   - **Site URL**: `https://monsurhillas.vercel.app`
   - **Redirect URLs**: add `https://monsurhillas.vercel.app/auth/callback`
     (and `http://localhost:3000/auth/callback` too if you want Google
     sign-in to work when running the site locally).

That's it for auth — the app already restricts writes to
`hillasmonsur@gmail.com` both in the UI and in the database (Row Level
Security), so anyone else who somehow signs in still can't change anything.

## 3. Add environment variables in Vercel

Once the Vercel project exists (I'll create and deploy it), go to
**Project → Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dxrwiuvfccsydmhunzgx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_fja1JBPoR1432rRypVtxlg_RpZwbqr4` |

Apply to all environments (Production, Preview, Development), save, then
redeploy (Vercel → Deployments → ⋯ on the latest one → Redeploy) so the new
variables take effect.

## 4. (Optional) Turn on the automated Jobs fetch

The admin panel's **Jobs** section works fully with the manual "Add job"
button even without this. To also get bank/data/product listings in Dhaka
fetched automatically once a day:

1. **Get a Supabase service-role key**: Supabase dashboard →
   **Project Settings → API → Project API keys → `service_role`** (click
   reveal, then copy). This key bypasses Row Level Security, so treat it
   like a password — never commit it or share it outside Vercel's env vars.
2. **Get a JSearch API key**: sign up at
   [rapidapi.com](https://rapidapi.com/), subscribe to the **JSearch** API
   (it has a free tier), then copy your RapidAPI key.
3. **Pick a `CRON_SECRET`**: any long random string you generate yourself
   (e.g. `openssl rand -hex 32`).
4. In Vercel → **Project → Settings → Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `SUPABASE_SERVICE_ROLE_KEY` | *(from step 1)* |
   | `JSEARCH_API_KEY` | *(from step 2)* |
   | `CRON_SECRET` | *(from step 3)* |

   Apply to Production (and Preview if you want), save, then redeploy.
5. The cron is already wired up in `vercel.json` (`/api/cron/fetch-jobs`,
   once daily) — Vercel picks it up automatically on deploy and sends
   `CRON_SECRET` in the request itself, so no further setup is needed.

Bangladesh/bdjobs.com coverage on JSearch is thin (it's not an officially
supported country there), so this is meant as a supplement to — not a
replacement for — adding links yourself when you spot something on
LinkedIn or bdjobs directly.

## Using it day to day

- Public site: `https://monsurhillas.vercel.app`
- Admin panel: `https://monsurhillas.vercel.app/admin` — sign in with
  Google using `hillasmonsur@gmail.com`, edit anything, it saves straight
  to the database and reflects on the live site immediately (no redeploy
  needed for content changes — only for code changes).
- To change the CV/resume file later: replace `public/resume.pdf` in the
  repo (or ask me to) and push — the "Download CV" button always points to
  that file.

## Security note

You pasted a GitHub personal access token into this chat earlier so I
could create/push the repo. That's fine for a one-time setup, but since
it's now in this conversation's history, it's good practice to revoke it
once everything's pushed and generate a fresh one only if you need me (or
any tool) to push again later: github.com/settings/tokens.
