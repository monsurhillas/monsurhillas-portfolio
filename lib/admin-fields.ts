export type FieldType = "text" | "textarea" | "list" | "url";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
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
