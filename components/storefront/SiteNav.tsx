"use client";

import { User } from "lucide-react";
import { Logo } from "@/components/Logo";

export function SiteNav({
  storeName = "Subly",
  logoUrl,
}: {
  storeName?: string;
  logoUrl?: string | null;
}) {
  return (
    <header className="site">
      <div className="wrap">
        <nav>
          <a className="logo" href="#">
            <Logo storeName={storeName} logoUrl={logoUrl} />
          </a>
          <div className="navlinks">
            <a href="#shop">All Subscriptions</a>
            <a href="#shop">AI Tools</a>
            <a href="#shop">Streaming</a>
            <a href="#bundle">Bundles</a>
            <a href="#faq">Support</a>
          </div>
          <div className="nav-right">
            <a className="iconbtn" aria-label="Account" href="/admin">
              <User size={18} />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

