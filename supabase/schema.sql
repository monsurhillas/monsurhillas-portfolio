-- Portfolio site schema for MD Monsur Hillas
-- Run this once against your Supabase project (SQL Editor, or via the
-- Supabase MCP `apply_migration` tool). Safe to re-run: uses IF NOT EXISTS
-- and CREATE OR REPLACE where possible.

-- The single email allowed to write. Change this in every policy below if
-- the admin email ever changes.
-- Admin email: hillasmonsur@gmail.com

create extension if not exists "pgcrypto";

-- ---------- Tables ----------

create table if not exists profile (
  id int primary key default 1,
  name text not null default '',
  title text not null default '',
  summary text not null default '',
  email text not null default '',
  phone text not null default '',
  location text not null default '',
  photo_url text not null default '',
  resume_url text not null default '',
  linkedin_url text not null default '',
  github_url text not null default '',
  twitter_url text not null default '',
  updated_at timestamptz not null default now(),
  constraint profile_singleton check (id = 1)
);

create table if not exists experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text not null,
  start_date text not null,
  end_date text,
  bullets text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  degree text not null,
  institution text not null,
  date text not null default '',
  detail text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  items text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists awards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null default '',
  date text not null default '',
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  link text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists research (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  link text,
  date text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
-- Public (anon + authenticated) can always SELECT. Only a session whose
-- verified JWT email matches the admin address may INSERT/UPDATE/DELETE.
-- This is enforced by Postgres itself, independent of the app's UI code.

alter table profile enable row level security;
alter table experience enable row level security;
alter table education enable row level security;
alter table skills enable row level security;
alter table awards enable row level security;
alter table projects enable row level security;
alter table research enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array['profile','experience','education','skills','awards','projects','research'])
  loop
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);

    execute format('drop policy if exists "admin write" on %I', t);
    execute format(
      'create policy "admin write" on %I for all using ((auth.jwt() ->> ''email'') = ''hillasmonsur@gmail.com'') with check ((auth.jwt() ->> ''email'') = ''hillasmonsur@gmail.com'')',
      t
    );
  end loop;
end $$;

-- ---------- Seed data (safe to run once) ----------

insert into profile (id, name, title, summary, email, phone, location, photo_url, resume_url, linkedin_url, github_url, twitter_url)
values (
  1,
  'MD Monsur Hillas',
  'Manager, Portfolio Management & Structured Credit',
  'Structured Credit and Portfolio Management professional with 4+ years of experience managing foreign debt portfolios, covenant compliance, investor reporting, and portfolio analytics. Currently managing a $70M+ portfolio across 9 investors with 100% covenant compliance, while supporting capital raising, lender due diligence, and CXO-level reporting. Strong background in SQL, Metabase, MIS automation, financial modeling, and risk analytics, with proven impact in reducing reporting turnaround time and improving portfolio visibility.',
  'hillasmonsur@gmail.com',
  '+8801744337974',
  'Khilkhet, Dhaka-1229',
  '/profile-photo.jpg',
  '/resume.pdf',
  'https://www.linkedin.com/in/monsurhillas',
  'https://github.com/monsurhillas',
  ''
)
on conflict (id) do nothing;

insert into experience (role, company, start_date, end_date, bullets, sort_order) values
('Manager, Structured Credit and Portfolio Management', 'ShopUp', 'Apr 2025', null, array[
  'Owning and optimizing performance of a $70M+ digital lending portfolio, using data insights to improve product-level decision-making and risk strategies',
  'Collaborating with cross-functional stakeholders (finance, operations, leadership) to align portfolio strategy with business and product goals',
  'Translating investor and business requirements into structured reporting and data outputs, supporting strategic roadmap decisions',
  'Supported capital raise of USD 110M by preparing product and portfolio insights, performance metrics, and risk narratives for stakeholders',
  'Working on investor communication workflows, ensuring transparency and alignment on product performance and growth metrics'
], 0),
('Program Manager', 'ShopUp', 'Aug 2023', 'Mar 2025', array[
  'Managed a digital credit product portfolio, leveraging user behavior and repayment analytics to inform product roadmap and risk strategy decisions',
  'Built and maintained 10+ KPI dashboards for product performance monitoring, enabling 30% faster data-driven decision-making across teams',
  'Conducted customer segmentation and cohort analysis to optimize lending strategies, contributing to a 15% reduction in default rates',
  'Collaborated with product, engineering, and operations teams to enhance reporting infrastructure and improve data accessibility for stakeholders',
  'Delivered actionable insights from 50+ stakeholder queries per quarter, driving iterative improvements in product performance and operational efficiency'
], 1),
('Junior Program Manager', 'ShopUp', 'Apr 2022', 'Jul 2023', array[
  'Worked cross-functionally with developers to support iterative product improvements, led UAT activities before launch, and monitored post-launch product performance and stability',
  'Contributed to the revamp of the LMS platform by enhancing user experience, strengthening security controls, and improving audit and compliance readiness',
  'Managed digital lending portfolios and ensured portfolio health (NPL <5%) through continuous monitoring and optimization',
  'Led MIS automation initiative, reducing reporting time from 10 days to 1 day and improving real-time decision support'
], 2),
('Intern, Product Management', 'ShopUp', 'Dec 2021', 'Mar 2021', array[
  'Collaborated with cross-functional teams to launch multiple products, supporting go-to-market execution and ongoing product operations',
  'Monitored product KPIs such as retention, churn, and adoption rates, providing insights that informed feature enhancements and product improvements'
], 3)
on conflict do nothing;

insert into education (degree, institution, date, detail, sort_order) values
('MSc in Computer Science and Engineering', 'North South University', 'Aug 2025', 'CGPA: 3.09', 0),
('BSc in Computer Science and Engineering', 'North South University', 'Aug 2021', 'CGPA: 3.52 (Cum Laude Distinction)', 1)
on conflict do nothing;

insert into skills (category, items, sort_order) values
('Product & Strategy', array['Product Analytics','KPI Definition','Customer Journey Mapping','User Segmentation & Retention','Strategy & Growth Metrics'], 0),
('Data & Analytics', array['SQL','Metabase','Data Visualization','Exploratory Data Analysis','Dashboarding, Reporting & Insights'], 1),
('Tools & Systems', array['Microsoft Excel','Google Sheets','MIS Reporting Automation'], 2),
('Finance & Domain', array['Digital Lending','Risk Monitoring','Financial Modeling'], 3)
on conflict do nothing;

insert into awards (title, issuer, date, description, sort_order) values
('Value Hero: Demand Highest Standard', 'ShopUp', 'Jun 2025', 'Recognized for delivering investor reporting with 100% accuracy, transparency, and proactive data communication under high-stakes conditions.', 0),
('ShopUp Spotlight', 'ShopUp', 'Dec 2024', 'Selected as a rising star for consistently exceeding expectations and driving high-impact results across strategic portfolio initiatives.', 1),
('Value Hero: Do More With Less', 'ShopUp', 'Nov 2023', 'Awarded for streamlining the monthly MIS process in Q4 2023, reducing preparation time from 10 days to 1 day and improving efficiency and leadership visibility.', 2)
on conflict do nothing;
