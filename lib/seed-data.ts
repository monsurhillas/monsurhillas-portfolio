import type { SiteContent } from "./types";

// Fallback content, transcribed from MD Monsur Hillas's CV (Aug 2026).
// This renders the site correctly even before Supabase is wired up, and
// acts as the seed data inserted into the database on first setup.
export const seedContent: SiteContent = {
  profile: {
    id: 1,
    name: "MD Monsur Hillas",
    title: "Manager, Portfolio Management & Structured Credit",
    summary:
      "Structured Credit and Portfolio Management professional with 4+ years of experience managing foreign debt portfolios, covenant compliance, investor reporting, and portfolio analytics. Currently managing a $70M+ portfolio across 9 investors with 100% covenant compliance, while supporting capital raising, lender due diligence, and CXO-level reporting. Strong background in SQL, Metabase, MIS automation, financial modeling, and risk analytics, with proven impact in reducing reporting turnaround time and improving portfolio visibility.",
    email: "hillasmonsur@gmail.com",
    phone: "+8801744337974",
    location: "Khilkhet, Dhaka-1229",
    photo_url: "/profile-photo.jpg",
    resume_url: "/resume.pdf",
    linkedin_url: "https://www.linkedin.com/in/monsurhillas",
    github_url: "https://github.com/monsurhillas",
    twitter_url: "",
  },
  experience: [
    {
      id: "exp-1",
      role: "Manager, Structured Credit and Portfolio Management",
      company: "ShopUp",
      start_date: "Apr 2025",
      end_date: null,
      bullets: [
        "Owning and optimizing performance of a $70M+ digital lending portfolio, using data insights to improve product-level decision-making and risk strategies",
        "Collaborating with cross-functional stakeholders (finance, operations, leadership) to align portfolio strategy with business and product goals",
        "Translating investor and business requirements into structured reporting and data outputs, supporting strategic roadmap decisions",
        "Supported capital raise of USD 110M by preparing product and portfolio insights, performance metrics, and risk narratives for stakeholders",
        "Working on investor communication workflows, ensuring transparency and alignment on product performance and growth metrics",
      ],
      sort_order: 0,
    },
    {
      id: "exp-2",
      role: "Program Manager",
      company: "ShopUp",
      start_date: "Aug 2023",
      end_date: "Mar 2025",
      bullets: [
        "Managed a digital credit product portfolio, leveraging user behavior and repayment analytics to inform product roadmap and risk strategy decisions",
        "Built and maintained 10+ KPI dashboards for product performance monitoring, enabling 30% faster data-driven decision-making across teams",
        "Conducted customer segmentation and cohort analysis to optimize lending strategies, contributing to a 15% reduction in default rates",
        "Collaborated with product, engineering, and operations teams to enhance reporting infrastructure and improve data accessibility for stakeholders",
        "Delivered actionable insights from 50+ stakeholder queries per quarter, driving iterative improvements in product performance and operational efficiency",
      ],
      sort_order: 1,
    },
    {
      id: "exp-3",
      role: "Junior Program Manager",
      company: "ShopUp",
      start_date: "Apr 2022",
      end_date: "Jul 2023",
      bullets: [
        "Worked cross-functionally with developers to support iterative product improvements, led UAT activities before launch, and monitored post-launch product performance and stability",
        "Contributed to the revamp of the LMS platform by enhancing user experience, strengthening security controls, and improving audit and compliance readiness",
        "Managed digital lending portfolios and ensured portfolio health (NPL <5%) through continuous monitoring and optimization",
        "Led MIS automation initiative, reducing reporting time from 10 days to 1 day and improving real-time decision support",
      ],
      sort_order: 2,
    },
    {
      id: "exp-4",
      role: "Intern, Product Management",
      company: "ShopUp",
      start_date: "Dec 2021",
      end_date: "Mar 2021",
      bullets: [
        "Collaborated with cross-functional teams to launch multiple products, supporting go-to-market execution and ongoing product operations",
        "Monitored product KPIs such as retention, churn, and adoption rates, providing insights that informed feature enhancements and product improvements",
      ],
      sort_order: 3,
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "MSc in Computer Science and Engineering",
      institution: "North South University",
      date: "Aug 2025",
      detail: "CGPA: 3.09",
      sort_order: 0,
    },
    {
      id: "edu-2",
      degree: "BSc in Computer Science and Engineering",
      institution: "North South University",
      date: "Aug 2021",
      detail: "CGPA: 3.52 (Cum Laude Distinction)",
      sort_order: 1,
    },
  ],
  skills: [
    {
      id: "skill-1",
      category: "Product & Strategy",
      items: [
        "Product Analytics",
        "KPI Definition",
        "Customer Journey Mapping",
        "User Segmentation & Retention",
        "Strategy & Growth Metrics",
      ],
      sort_order: 0,
    },
    {
      id: "skill-2",
      category: "Data & Analytics",
      items: [
        "SQL",
        "Metabase",
        "Data Visualization",
        "Exploratory Data Analysis",
        "Dashboarding, Reporting & Insights",
      ],
      sort_order: 1,
    },
    {
      id: "skill-3",
      category: "Tools & Systems",
      items: ["Microsoft Excel", "Google Sheets", "MIS Reporting Automation"],
      sort_order: 2,
    },
    {
      id: "skill-4",
      category: "Finance & Domain",
      items: ["Digital Lending", "Risk Monitoring", "Financial Modeling"],
      sort_order: 3,
    },
  ],
  awards: [
    {
      id: "award-1",
      title: "Value Hero: Demand Highest Standard",
      issuer: "ShopUp",
      date: "Jun 2025",
      description:
        "Recognized for delivering investor reporting with 100% accuracy, transparency, and proactive data communication under high-stakes conditions.",
      sort_order: 0,
    },
    {
      id: "award-2",
      title: "ShopUp Spotlight",
      issuer: "ShopUp",
      date: "Dec 2024",
      description:
        "Selected as a rising star for consistently exceeding expectations and driving high-impact results across strategic portfolio initiatives.",
      sort_order: 1,
    },
    {
      id: "award-3",
      title: "Value Hero: Do More With Less",
      issuer: "ShopUp",
      date: "Nov 2023",
      description:
        "Awarded for streamlining the monthly MIS process in Q4 2023, reducing preparation time from 10 days to 1 day and improving efficiency and leadership visibility.",
      sort_order: 2,
    },
  ],
  projects: [],
  research: [],
};
