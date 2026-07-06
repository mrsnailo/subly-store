"use client";

import { useCart } from "@/components/cart/CartProvider";

export function SiteNav({ storeName = "Subly" }: { storeName?: string }) {
  const { count, openCart } = useCart();
  return (
    <header className="site">
      <div className="wrap">
        <nav>
          <a className="logo" href="#">
            <span className="mark">
              <span />
            </span>
            {storeName}
          </a>
          <div className="navlinks">
            <a href="#shop">All Subscriptions</a>
            <a href="#shop">AI Tools</a>
            <a href="#shop">Streaming</a>
            <a href="#bundle">Bundles</a>
            <a href="#faq">Support</a>
          </div>
          <div className="nav-right">
            <div className="search">
              <span>🔍</span>
              <input placeholder="Search Netflix, ChatGPT…" />
            </div>
            <a className="iconbtn" aria-label="Account" href="/admin">
              👤
            </a>
            <button className="iconbtn" aria-label="Cart" onClick={openCart}>
              🛒
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
