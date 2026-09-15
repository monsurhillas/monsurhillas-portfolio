import { getContent } from "@/lib/get-content";
import PortfolioEditor from "@/components/admin/PortfolioEditor";

// The auth gate now lives in app/admin/layout.tsx, shared by every section.
// This page only renders once we already know the visitor is the admin.
// PortfolioEditor is a client component and creates its own browser Supabase
// client (a server client instance can't be passed across the boundary).
export default async function AdminPortfolioPage() {
  const content = await getContent();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Portfolio update
        </h1>
        <p className="text-sm text-muted">
          Edit the content shown on your public profile.
        </p>
      </div>
      <PortfolioEditor content={content} />
    </div>
  );
}
