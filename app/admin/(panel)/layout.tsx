import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata = { title: "Admin · Subly" };

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <Sidebar ownerName={session.user.name ?? session.user.email ?? "Owner"} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
