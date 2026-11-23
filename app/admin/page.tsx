import PageHeader from "@/components/admin/ui/PageHeader";
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
      <PageHeader title="Portfolio update" description="Edit the content shown on your public profile." />
      <PortfolioEditor content={content} />
    </div>
  );
}
