export interface Profile {
  id: number;
  name: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  photo_url: string;
  resume_url: string;
  linkedin_url: string;
  github_url: string;
  twitter_url: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  start_date: string;
  end_date: string | null; // null/'' => Present
  bullets: string[];
  sort_order: number;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  date: string;
  detail: string;
  sort_order: number;
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string[];
  sort_order: number;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  sort_order: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface ResearchItem {
  id: string;
  title: string;
  description: string;
  link: string | null;
  date: string;
  sort_order: number;
}

export interface SiteContent {
  profile: Profile;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  awards: AwardItem[];
  projects: ProjectItem[];
  research: ResearchItem[];
}

export const TABLES = {
  profile: "profile",
  experience: "experience",
  education: "education",
  skills: "skills",
  awards: "awards",
  projects: "projects",
  research: "research",
} as const;
