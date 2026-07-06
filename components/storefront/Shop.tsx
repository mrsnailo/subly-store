"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { bdt } from "@/lib/format";
import type { StoreCategory, StoreProduct } from "@/lib/queries";

function ProductCard({ product, isOpen = true }: { product: StoreProduct; isOpen?: boolean }) {
  const { addItem } = useCart();
  const [sel, setSel] = useState(0);
  const d = product.durations[sel] ?? product.durations[0];

  return (
    <div className="card">
      {product.badgeText && (
        <span className={`badge ${product.badgeKind ?? ""}`}>
          {product.badgeText}
        </span>
      )}
      <div className="brandhead" style={{ background: product.brandBg }}>
        <span className="wm" style={{ color: product.brandColor }}>
          {product.wordmark}
        </span>
      </div>
      <h3>{product.name}</h3>
      <div className="ptag">{product.tagline}</div>
      <div className="stars">
        <span className="st">★★★★★</span>
        {product.rating.toFixed(1)}
      </div>
      <div className="durs">
        {product.durations.map((dur, i) => (
          <button
            key={dur.id}
            className={`dur ${i === sel ? "active" : ""}`}
            onClick={() => setSel(i)}
          >
            {dur.label}
          </button>
        ))}
      </div>
      <div className="priceline">
        <span className="now">{bdt(d.price)}</span>
        {d.wasPrice != null && <span className="was">{bdt(d.wasPrice)}</span>}
        <span className="per">/ {d.label}</span>
      </div>
      <button
        className="btn btn-ink add"
        disabled={!isOpen}
        style={!isOpen ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
        onClick={() =>
          isOpen && addItem({
            key: `${product.id}-${d.label}`,
            name: product.name,
            duration: d.label,
            price: d.price,
            color: product.brandColor,
          })
        }
      >
        {isOpen ? "＋ Add to cart" : "Store Closed"}
      </button>
    </div>
  );
}

export function Shop({
  categories,
  products,
  isOpen = true,
}: {
  categories: StoreCategory[];
  products: StoreProduct[];
  isOpen?: boolean;
}) {
  const [active, setActive] = useState("all");
  const list =
    active === "all"
      ? products
      : products.filter((p) => p.categorySlug === active);

  return (
    <section id="shop" className="block">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="kicker">Marketplace</div>
            <h2>Pick your subscription</h2>
            <p>
              Genuine accounts &amp; upgrades. Choose a duration, add to cart,
              pay locally.
            </p>
          </div>
          <a href="#shop" className="btn btn-ghost">
            View all {products.length}+ →
          </a>
        </div>

        <div className="cats">
          <button
            className={`pill ${active === "all" ? "active" : ""}`}
            onClick={() => setActive("all")}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`pill ${active === c.slug ? "active" : ""}`}
              onClick={() => setActive(c.slug)}
            >
              {c.emoji ? `${c.emoji} ` : ""}
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid">
          {list.length === 0 ? (
            <div className="empty-grid">No subscriptions in this category yet.</div>
          ) : (
            list.map((p) => <ProductCard key={p.id} product={p} isOpen={isOpen} />)
          )}
        </div>
      </div>
    </section>
  );
}
