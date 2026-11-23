import PageHeader from "@/components/admin/ui/PageHeader";
import { getVaultCredentials } from "@/lib/get-admin-data";
import VaultSection from "@/components/admin/VaultSection";

export default async function AdminVaultPage() {
  const credentials = await getVaultCredentials();

  return (
    <div>
      <PageHeader title={"Password vault"} description={"All your logins in one place. Passwords are encrypted in your browser with a master passphrase before they’re ever saved — the passphrase itself never leaves your device."} />
      <VaultSection initialItems={credentials} />
    </div>
  );
}
