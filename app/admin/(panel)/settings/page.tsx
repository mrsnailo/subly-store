import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });

  const defaults = {
    storeName: settings?.storeName ?? "Subly Store",
    contactEmail: settings?.contactEmail ?? "owner@subly.shop",
    whatsApp: settings?.whatsApp ?? "+880",
    currency: settings?.currency ?? "BDT",
    isOpen: settings?.isOpen ?? true,
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Settings</h1>
          <p>Store identity, contact channels, currency &amp; open/closed status.</p>
        </div>
      </div>

      <SettingsForm defaults={defaults} />
    </>
  );
}
