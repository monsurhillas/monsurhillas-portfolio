import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Runs once a day (Vercel Hobby plan's cron limit — see vercel.json) to pull
// bank/data/product listings in Dhaka from the JSearch API and upsert them
// into the `jobs` table. This is the "automated" half of the hybrid design;
// the admin UI's "Add job" button covers listings JSearch's still-thin
// Bangladesh/bdjobs.com coverage misses.
//
// Protected by CRON_SECRET so it can't be triggered by anyone else — Vercel
// sends this same secret in the Authorization header on scheduled
// invocations.

const QUERIES = [
  "bank jobs in Dhaka Bangladesh",
  "data analyst jobs in Dhaka Bangladesh",
  "product manager jobs in Dhaka Bangladesh",
];

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string | null;
  job_city: string | null;
  job_country: string | null;
  job_apply_link: string | null;
  job_description: string | null;
  job_posted_at_datetime_utc: string | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
}

function categorize(title: string): string {
  const t = title.toLowerCase();
  if (/bank|credit|loan|financ/.test(t)) return "Bank";
  if (/data|analyst|sql|bi\b/.test(t)) return "Data";
  if (/product/.test(t)) return "Product";
  return "Other";
}

function salaryRange(job: JSearchJob): string {
  if (!job.job_min_salary && !job.job_max_salary) return "";
  const cur = job.job_salary_currency ?? "";
  const min = job.job_min_salary ? Math.round(job.job_min_salary) : null;
  const max = job.job_max_salary ? Math.round(job.job_max_salary) : null;
  if (min && max) return `${cur} ${min}–${max}`;
  return `${cur} ${min ?? max}`;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "JSEARCH_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role isn't configured" },
      { status: 500 }
    );
  }

  let fetched = 0;
  let upserted = 0;
  const errors: string[] = [];

  for (const query of QUERIES) {
    try {
      const url = new URL("https://jsearch.p.rapidapi.com/search");
      url.searchParams.set("query", query);
      url.searchParams.set("page", "1");
      url.searchParams.set("num_pages", "1");
      url.searchParams.set("date_posted", "week");

      const res = await fetch(url.toString(), {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      if (!res.ok) {
        errors.push(`"${query}": HTTP ${res.status}`);
        continue;
      }

      const json = (await res.json()) as { data?: JSearchJob[] };
      const jobs = json.data ?? [];
      fetched += jobs.length;

      for (const job of jobs) {
        const metadata = {
          title: job.job_title,
          company: job.employer_name ?? "",
          location: job.job_city ?? "Dhaka",
          link: job.job_apply_link,
          category: categorize(job.job_title),
          salary_range: salaryRange(job),
          posted_date: job.job_posted_at_datetime_utc?.slice(0, 10) ?? "",
          description: (job.job_description ?? "").slice(0, 2000),
          updated_at: new Date().toISOString(),
        };

        // Dedup on external_id, but never overwrite a status or notes the
        // admin has already set on a listing we've seen before — only
        // refresh the listing's own metadata (title, link, salary, etc).
        const { data: existing } = await supabase
          .from("jobs")
          .select("id")
          .eq("external_id", job.job_id)
          .maybeSingle();

        const { error } = existing
          ? await supabase.from("jobs").update(metadata).eq("id", existing.id)
          : await supabase.from("jobs").insert({
              ...metadata,
              external_id: job.job_id,
              source: "jsearch",
              status: "Interested",
              notes: "",
            });

        if (error) errors.push(`${job.job_id}: ${error.message}`);
        else upserted++;
      }
    } catch (e) {
      errors.push(`"${query}": ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  return NextResponse.json({ fetched, upserted, errors });
}
