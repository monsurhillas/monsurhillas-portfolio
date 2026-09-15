import { getDocuments, filterExpiringSoon } from "@/lib/get-admin-data";
import DocumentsSection from "@/components/admin/DocumentsSection";

export default async function AdminDocumentsPage() {
  const documents = await getDocuments();
  const expiringSoon = filterExpiringSoon(documents);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="text-sm text-muted">
          Metadata for your important documents — NID, passport,
          certificates, policies — so reference numbers and expiry dates are
          in one place. No files are uploaded or stored, just the details.
        </p>
      </div>
      <DocumentsSection initialItems={documents} expiringSoon={expiringSoon} />
    </div>
  );
}
