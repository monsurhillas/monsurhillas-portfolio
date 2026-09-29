// Category-aware field schema for the password vault. Each category (and,
// for Social Media, each platform) gets its own set of fields so an entry
// asks for exactly what that kind of login needs — a bank portal wants a
// branch and T-PIN, a social account wants a handle and recovery email.
//
// Only `website` (used as a display label), `username`, `category`, and
// `platform` are stored in plaintext columns, purely so the list can be
// browsed without decrypting anything. Every other field defined below is
// serialized to JSON and encrypted as a single blob (see lib/crypto.ts) —
// the shape of that JSON simply follows whichever category's secretFields
// were active when the entry was saved.

export const VAULT_CATEGORIES = [
  "Social Media",
  "Banking",
  "Email",
  "Work",
  "Other",
] as const;

export type VaultCategory = (typeof VAULT_CATEGORIES)[number];

export const SOCIAL_PLATFORMS = [
  "Facebook",
  "Instagram",
  "Snapchat",
  "X (Twitter)",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "WhatsApp",
  "Telegram",
  "Threads",
  "Pinterest",
  "Reddit",
  "Discord",
  "Other",
] as const;

// A rough brand color per platform, used only for a small colored dot next
// to the platform badge — purely decorative.
export const PLATFORM_COLORS: Record<string, string> = {
  Facebook: "#1877F2",
  Instagram: "#E1306C",
  Snapchat: "#F7C600",
  "X (Twitter)": "#111111",
  LinkedIn: "#0A66C2",
  TikTok: "#25F4EE",
  YouTube: "#FF0000",
  WhatsApp: "#25D366",
  Telegram: "#26A5E4",
  Threads: "#111111",
  Pinterest: "#E60023",
  Reddit: "#FF4500",
  Discord: "#5865F2",
  Other: "#8b8b8b",
};

export interface VaultFieldDef {
  key: string;
  label: string;
  type: "text" | "password" | "textarea";
  placeholder?: string;
  optional?: boolean;
}

export interface VaultCategoryConfig {
  category: VaultCategory;
  icon: "share" | "landmark" | "mail" | "briefcase" | "key";
  labelField: { label: string; placeholder: string };
  usernameField: { label: string; placeholder?: string };
  hasPlatform: boolean;
  secretFields: VaultFieldDef[];
}

export const VAULT_CATEGORY_CONFIG: Record<VaultCategory, VaultCategoryConfig> =
  {
    "Social Media": {
      category: "Social Media",
      icon: "share",
      labelField: {
        label: "Account label",
        placeholder: "e.g. Personal Instagram",
      },
      usernameField: { label: "Username / handle", placeholder: "@handle" },
      hasPlatform: true,
      secretFields: [
        { key: "password", label: "Password", type: "password" },
        {
          key: "email",
          label: "Linked email",
          type: "text",
          optional: true,
        },
        {
          key: "phone",
          label: "Phone number",
          type: "text",
          optional: true,
        },
        {
          key: "recovery",
          label: "Recovery email / phone",
          type: "text",
          optional: true,
        },
        { key: "notes", label: "Notes", type: "textarea", optional: true },
      ],
    },
    Banking: {
      category: "Banking",
      icon: "landmark",
      labelField: { label: "Bank name", placeholder: "e.g. BRAC Bank" },
      usernameField: {
        label: "Username",
        placeholder: "Internet/mobile banking username",
      },
      hasPlatform: false,
      secretFields: [
        { key: "account_name", label: "Account name", type: "text" },
        {
          key: "user_id",
          label: "User ID",
          type: "text",
          optional: true,
        },
        { key: "branch", label: "Branch", type: "text", optional: true },
        {
          key: "routing_number",
          label: "Routing number",
          type: "text",
          optional: true,
        },
        {
          key: "password",
          label: "Internet banking password",
          type: "password",
        },
        {
          key: "app_password",
          label: "App password",
          type: "password",
          optional: true,
        },
        { key: "tpin", label: "T-PIN", type: "password", optional: true },
        { key: "notes", label: "Notes", type: "textarea", optional: true },
      ],
    },
    Email: {
      category: "Email",
      icon: "mail",
      labelField: { label: "Provider", placeholder: "e.g. Gmail" },
      usernameField: { label: "Email address" },
      hasPlatform: false,
      secretFields: [
        { key: "password", label: "Password", type: "password" },
        {
          key: "recovery",
          label: "Recovery email / phone",
          type: "text",
          optional: true,
        },
        { key: "notes", label: "Notes", type: "textarea", optional: true },
      ],
    },
    Work: {
      category: "Work",
      icon: "briefcase",
      labelField: {
        label: "Service / website",
        placeholder: "e.g. Company VPN",
      },
      usernameField: { label: "Username" },
      hasPlatform: false,
      secretFields: [
        { key: "password", label: "Password", type: "password" },
        { key: "notes", label: "Notes", type: "textarea", optional: true },
      ],
    },
    Other: {
      category: "Other",
      icon: "key",
      labelField: {
        label: "Website / service",
        placeholder: "e.g. example.com",
      },
      usernameField: { label: "Username / email" },
      hasPlatform: false,
      secretFields: [
        { key: "password", label: "Password", type: "password" },
        { key: "notes", label: "Notes", type: "textarea", optional: true },
      ],
    },
  };

export function vaultCategoryConfig(
  category: string
): VaultCategoryConfig {
  return (
    VAULT_CATEGORY_CONFIG[category as VaultCategory] ??
    VAULT_CATEGORY_CONFIG.Other
  );
}
