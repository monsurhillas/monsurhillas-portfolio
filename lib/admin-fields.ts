export type FieldType =
  | "text"
  | "textarea"
  | "list"
  | "url"
  | "number"
  | "date"
  | "select";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[]; // for type: "select"
  nullable?: boolean; // empty value is stored as null, not "" or 0
}

export interface TableConfig {
  table: string;
  title: string;
  singular: string;
  fields: FieldConfig[];
  emptyItem: Record<string, unknown>;
}

export const TABLE_CONFIGS: TableConfig[] = [
  {
    table: "experience",
    title: "Experience",
    singular: "role",
    fields: [
      { key: "role", label: "Role", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "start_date", label: "Start date", type: "text", placeholder: "Apr 2025" },
      {
        key: "end_date",
        label: "End date (blank = Present)",
        type: "text",
        placeholder: "Mar 2025",
      },
      {
        key: "bullets",
        label: "Bullet points (one per line)",
        type: "list",
      },
      { key: "sort_order", label: "Sort order", type: "text" },
    ],
    emptyItem: {
      role: "",
      company: "",
      start_date: "",
      end_date: "",
      bullets: [],
      sort_order: 0,
    },
  },
  {
    table: "education",
    title: "Education",
    singular: "degree",
    fields: [
      { key: "degree", label: "Degree", type: "text" },
      { key: "institution", label: "Institution", type: "text" },
      { key: "date", label: "Date", type: "text", placeholder: "Aug 2025" },
      { key: "detail", label: "Detail", type: "text", placeholder: "CGPA: 3.09" },
      { key: "sort_order", label: "Sort order", type: "text" },
    ],
    emptyItem: { degree: "", institution: "", date: "", detail: "", sort_order: 0 },
  },
  {
    table: "skills",
    title: "Skills",
    singular: "skill group",
    fields: [
      { key: "category", label: "Category", type: "text" },
      { key: "items", label: "Skills (one per line)", type: "list" },
      { key: "sort_order", label: "Sort order", type: "text" },
    ],
    emptyItem: { category: "", items: [], sort_order: 0 },
  },
  {
    table: "awards",
    title: "Awards",
    singular: "award",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "issuer", label: "Issuer", type: "text" },
      { key: "date", label: "Date", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sort_order", label: "Sort order", type: "text" },
    ],
    emptyItem: { title: "", issuer: "", date: "", description: "", sort_order: 0 },
  },
  {
    table: "projects",
    title: "Projects",
    singular: "project",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "tags", label: "Tags (one per line)", type: "list" },
      { key: "link", label: "Link", type: "url" },
      { key: "image_url", label: "Image URL", type: "url" },
      { key: "sort_order", label: "Sort order", type: "text" },
    ],
    emptyItem: {
      title: "",
      description: "",
      tags: [],
      link: "",
      image_url: "",
      sort_order: 0,
    },
  },
  {
    table: "research",
    title: "Research",
    singular: "publication",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "link", label: "Link", type: "url" },
      { key: "date", label: "Date", type: "text" },
      { key: "sort_order", label: "Sort order", type: "text" },
    ],
    emptyItem: { title: "", description: "", link: "", date: "", sort_order: 0 },
  },
];

// ---------- Private/personal dashboard tables (admin-only RLS) ----------
// These use the same GenericEditor as the public content tables above, but
// several fields use the newer number/date/select types.

export const JOB_CONFIG: TableConfig = {
  table: "jobs",
  title: "Jobs",
  singular: "job",
  fields: [
    { key: "title", label: "Job title", type: "text" },
    { key: "company", label: "Company", type: "text" },
    { key: "location", label: "Location", type: "text", placeholder: "Dhaka" },
    { key: "link", label: "Link to apply", type: "url" },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: ["Bank", "Data", "Product", "Other"],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Interested", "Applied", "Interview", "Offer", "Rejected"],
    },
    { key: "salary_range", label: "Salary range", type: "text" },
    { key: "posted_date", label: "Posted date", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  emptyItem: {
    title: "",
    company: "",
    location: "Dhaka",
    link: "",
    source: "manual",
    category: "Other",
    status: "Interested",
    salary_range: "",
    posted_date: "",
    description: "",
    notes: "",
  },
};

export const EXPENSE_CONFIG: TableConfig = {
  table: "expenses",
  title: "Expenses",
  singular: "expense",
  fields: [
    { key: "expense_date", label: "Date", type: "date" },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: [
        "Food",
        "Transport",
        "Bills",
        "Rent",
        "Shopping",
        "Health",
        "Entertainment",
        "Other",
      ],
    },
    { key: "amount", label: "Amount (BDT)", type: "number" },
    { key: "description", label: "Description", type: "text" },
    { key: "payment_method", label: "Payment method", type: "text" },
  ],
  emptyItem: {
    expense_date: new Date().toISOString().slice(0, 10),
    category: "Other",
    amount: 0,
    description: "",
    payment_method: "",
  },
};

export const DOCUMENT_CONFIG: TableConfig = {
  table: "documents",
  title: "Documents",
  singular: "document",
  fields: [
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["NID", "Passport", "Certificate", "Insurance", "Other"],
    },
    { key: "title", label: "Title", type: "text" },
    { key: "reference_number", label: "Reference number", type: "text" },
    { key: "issuing_authority", label: "Issuing authority", type: "text" },
    { key: "issue_date", label: "Issue date", type: "date", nullable: true },
    { key: "expiry_date", label: "Expiry date", type: "date", nullable: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  emptyItem: {
    type: "Other",
    title: "",
    reference_number: "",
    issuing_authority: "",
    issue_date: null,
    expiry_date: null,
    notes: "",
  },
};

export const FINANCIAL_INSTRUMENT_CONFIG: TableConfig = {
  table: "financial_instruments",
  title: "Financial instruments",
  singular: "instrument",
  fields: [
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["DPS", "FDR", "SIP", "Lumpsum", "Mutual Fund", "Other"],
    },
    { key: "institution", label: "Institution / bank", type: "text" },
    { key: "account_ref", label: "Account / folio no.", type: "text" },
    { key: "principal_amount", label: "Principal amount (BDT)", type: "number" },
    { key: "current_value", label: "Current value (BDT)", type: "number" },
    { key: "interest_rate", label: "Interest / return rate (%/yr)", type: "number" },
    {
      key: "monthly_installment",
      label: "Monthly installment (BDT, if any)",
      type: "number",
    },
    { key: "start_date", label: "Start date", type: "date", nullable: true },
    { key: "maturity_date", label: "Maturity date", type: "date", nullable: true },
    { key: "tenor_months", label: "Tenor (months)", type: "number", nullable: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  emptyItem: {
    type: "DPS",
    institution: "",
    account_ref: "",
    principal_amount: 0,
    current_value: 0,
    interest_rate: 0,
    monthly_installment: 0,
    start_date: null,
    maturity_date: null,
    tenor_months: null,
    notes: "",
  },
};

export const NET_WORTH_CONFIG: TableConfig = {
  table: "net_worth_entries",
  title: "Net worth snapshots",
  singular: "snapshot",
  fields: [
    { key: "entry_date", label: "Date", type: "date" },
    { key: "total_assets", label: "Total assets (BDT)", type: "number" },
    { key: "total_liabilities", label: "Total liabilities (BDT)", type: "number" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  emptyItem: {
    entry_date: new Date().toISOString().slice(0, 10),
    total_assets: 0,
    total_liabilities: 0,
    notes: "",
  },
};

export const FINANCIAL_GOAL_CONFIG: TableConfig = {
  table: "financial_goals",
  title: "Financial goals",
  singular: "goal",
  fields: [
    { key: "name", label: "Goal name", type: "text" },
    { key: "target_amount", label: "Target amount (BDT)", type: "number" },
    { key: "current_amount", label: "Current amount (BDT)", type: "number" },
    { key: "target_date", label: "Target date", type: "date", nullable: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  emptyItem: {
    name: "",
    target_amount: 0,
    current_amount: 0,
    target_date: null,
    notes: "",
  },
};
