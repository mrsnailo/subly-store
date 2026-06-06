"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/auth-actions";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "▣" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/products", label: "Products", icon: "📦" },
];

export function Sidebar({ ownerName }: { ownerName: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="admin-side">
      <a className="logo" href="/">
        <span className="mark">
          <span />
        </span>
        Subly
      </a>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`navi ${isActive(l.href) ? "active" : ""}`}
        >
          <span>{l.icon}</span>
          {l.label}
        </Link>
      ))}
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
          }}
        >
          <span>⎋</span> Sign out
        </button>
      </form>
    </aside>
  );
}
