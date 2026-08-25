import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Refreshes the Supabase auth session cookie on every request. Named
// `proxy` per the Next.js 16 convention (formerly `middleware`).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)",
  ],
};
