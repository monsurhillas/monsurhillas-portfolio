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

// ---------- Personal dashboard (private, admin-only) ----------

export type JobStatus =
  | "Interested"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  link: string | null;
  source: "manual" | "jsearch";
  external_id: string | null;
  category: string;
  status: JobStatus;
  salary_range: string;
  posted_date: string;
  description: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type FinancialInstrumentType =
  | "DPS"
  | "FDR"
  | "SIP"
  | "Lumpsum"
  | "Mutual Fund"
  | "Other";

export interface FinancialInstrument {
  id: string;
  type: FinancialInstrumentType;
  institution: string;
  account_ref: string;
  principal_amount: number;
  current_value: number;
  interest_rate: number;
  monthly_installment: number;
  start_date: string | null;
  maturity_date: string | null;
  tenor_months: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface VaultCredential {
  id: string;
  website: string;
  username: string;
  category: string;
  ciphertext: string;
  iv: string;
  salt: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  description: string;
  payment_method: string;
  created_at: string;
}

export type DocumentType =
  | "NID"
  | "Passport"
  | "Certificate"
  | "Insurance"
  | "Other";

export interface DocumentRecord {
  id: string;
  type: DocumentType;
  title: string;
  reference_number: string;
  issuing_authority: string;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string;
  created_at: string;
}

export interface NetWorthEntry {
  id: string;
  entry_date: string;
  total_assets: number;
  total_liabilities: number;
  notes: string;
  created_at: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  notes: string;
  created_at: string;
}

export const PRIVATE_TABLES = {
  jobs: "jobs",
  financial_instruments: "financial_instruments",
  vault_credentials: "vault_credentials",
  expenses: "expenses",
  documents: "documents",
  net_worth_entries: "net_worth_entries",
  financial_goals: "financial_goals",
} as const;
