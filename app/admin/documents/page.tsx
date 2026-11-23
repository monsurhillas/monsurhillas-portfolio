import PageHeader from "@/components/admin/ui/PageHeader";
import { getDocuments, filterExpiringSoon } from "@/lib/get-admin-data";
import DocumentsSection from "@/components/admin/DocumentsSection";

export default async function AdminDocumentsPage() {
  const documents = await getDocuments();
  const expiringSoon = filterExpiringSoon(documents);

  return (
    <div>
      <PageHeader title={"Documents"} description={"Metadata for your important documents — NID, passport, certificates, policies — so reference numbers and expiry dates are in one place. No files are uploaded or stored, just the details."} />
      <DocumentsSection initialItems={documents} expiringSoon={expiringSoon} />
    </div>
  );
}
