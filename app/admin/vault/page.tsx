import { getVaultCredentials } from "@/lib/get-admin-data";
import VaultSection from "@/components/admin/VaultSection";

export default async function AdminVaultPage() {
  const credentials = await getVaultCredentials();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Password vault
        </h1>
        <p className="text-sm text-muted">
          All your logins in one place. Passwords are encrypted in your
          browser with a master passphrase before they&rsquo;re ever saved —
          the passphrase itself never leaves your device.
        </p>
      </div>
      <VaultSection initialItems={credentials} />
    </div>
  );
}
