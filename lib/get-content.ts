import { createClient } from "@/lib/supabase/server";
import { seedContent } from "@/lib/seed-data";
import type {
  SiteContent,
  Profile,
  ExperienceItem,
  EducationItem,
  SkillGroup,
  AwardItem,
  ProjectItem,
  ResearchItem,
} from "@/lib/types";

// Fetches all site content from Supabase. If Supabase isn't configured yet,
// or any query fails, falls back to the static seed data transcribed from
// the CV — so the site always renders something correct.
export async function getContent(): Promise<SiteContent> {
  const supabase = await createClient();
  if (!supabase) return seedContent;

  try {
    const [profileRes, expRes, eduRes, skillsRes, awardsRes, projRes, researchRes] =
      await Promise.all([
        supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
        supabase.from("experience").select("*").order("sort_order"),
        supabase.from("education").select("*").order("sort_order"),
        supabase.from("skills").select("*").order("sort_order"),
        supabase.from("awards").select("*").order("sort_order"),
        supabase.from("projects").select("*").order("sort_order"),
        supabase.from("research").select("*").order("sort_order"),
      ]);

    return {
      profile: (profileRes.data as Profile) ?? seedContent.profile,
      experience: (expRes.data as ExperienceItem[]) ?? seedContent.experience,
      education: (eduRes.data as EducationItem[]) ?? seedContent.education,
      skills: (skillsRes.data as SkillGroup[]) ?? seedContent.skills,
      awards: (awardsRes.data as AwardItem[]) ?? seedContent.awards,
      projects: (projRes.data as ProjectItem[]) ?? seedContent.projects,
      research: (researchRes.data as ResearchItem[]) ?? seedContent.research,
    };
  } catch {
    return seedContent;
  }
}
