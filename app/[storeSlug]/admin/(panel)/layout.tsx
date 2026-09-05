import { getCurrentStoreId } from "@/lib/current-store";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { getStoreSettings } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin · Subly" };

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const requestedStoreId = await getCurrentStoreId();
  const userStoreId = (session.user as any).storeId;

  if (requestedStoreId !== userStoreId) {
    // User is logged in, but trying to access the WRONG store admin.
    // Find their real store slug
    const userStore = await prisma.store.findUnique({ where: { id: userStoreId } });
    if (userStore) {
      redirect(`/${userStore.slug}/admin`);
    } else {
      redirect("/admin/login"); // Fallback
    }
  }

  const settings = await getStoreSettings(userStoreId as string);

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
