import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { getStoreSettings } from "@/lib/queries";

export const metadata = { title: "Admin · Subly" };

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const settings = await getStoreSettings();

  return (
    <div className="admin-shell">
      <Sidebar 
        ownerName={session.user.name ?? session.user.email ?? "Owner"} 
        storeName={settings.storeName}
        logoUrl={settings.logoUrl}
      />
      <main className="admin-main">{children}</main>
    </div>
  );
}
