// The single email address allowed to authenticate into /admin and write
// content. This is a defense-in-depth client/UI check ONLY — the real
// enforcement lives in Supabase Row Level Security policies (see
// supabase/schema.sql), which check auth.jwt() ->> 'email' on every
// insert/update/delete. Even if this constant were removed or bypassed in
// the browser, the database itself rejects writes from any other account.
export const ADMIN_EMAIL = "hillasmonsur@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
