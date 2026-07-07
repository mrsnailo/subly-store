"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/auth-actions";
import { LayoutDashboard, Layers, Package, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  ownerName: string;
  storeName?: string;
  logoUrl?: string | null;
}

export function Sidebar({ ownerName, storeName = "Subly", logoUrl }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="admin-side">
      <a className="logo" href="/">
        <Logo storeName={storeName} logoUrl={logoUrl} />
      </a>
      {LINKS.map((l) => {
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`navi ${isActive(l.href) ? "active" : ""}`}
          >
            <Icon size={16} />
            {l.label}
          </Link>
        );
      })}
      <div className="spacer" />
      <div
        style={{
          fontSize: 12,
          color: "#9b9ca6",
          padding: "0 12px 10px",
        }}
      >
        Signed in as
        <br />
        <b style={{ color: "#fff" }}>{ownerName}</b>
      </div>
      <form action={logout}>
        <button
          className="navi"
          style={{
            width: "100%",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </form>
    </aside>
  );
}
