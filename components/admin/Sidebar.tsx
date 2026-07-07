"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/auth-actions";
import { LayoutDashboard, Layers, Package, Settings, LogOut, Menu, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="admin-mobile-bar">
        <a className="logo" href="/">
          <Logo storeName={storeName} logoUrl={logoUrl} />
        </a>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="admin-mobile-toggle"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="admin-sidebar-overlay" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`admin-side ${isOpen ? "open" : ""}`}>
        <a className="logo logo-desktop" href="/">
          <Logo storeName={storeName} logoUrl={logoUrl} />
        </a>
        <nav className="admin-nav-list" style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
          {LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setIsOpen(false)}
                className={`navi ${isActive(l.href) ? "active" : ""}`}
              >
                <Icon size={16} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="spacer" />
        <div className="admin-side-user">
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
        </div>
      </aside>
    </>
  );
}
