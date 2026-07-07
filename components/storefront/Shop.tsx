"use client";

import { useState } from "react";
import { Star, MessageCircle } from "lucide-react";
import { bdt, getWhatsAppLink } from "@/lib/format";
import type { StoreCategory, StoreProduct } from "@/lib/queries";
import { getCategoryCover } from "@/lib/category-covers";

function ProductCard({
  product,
  isOpen = true,
  whatsApp = "+880",
}: {
  product: StoreProduct;
  isOpen?: boolean;
  whatsApp?: string;
}) {
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
        <span className="st" style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
          {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            const isFilled = starValue <= Math.round(product.rating);
            return (
              <Star
                key={i}
                size={13}
                fill={isFilled ? "currentColor" : "none"}
                stroke="currentColor"
              />
            );
          })}
        </span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink-soft)" }}>
          {product.rating.toFixed(1)}
        </span>
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
      {isOpen ? (
        <a
          href={getWhatsAppLink(
            whatsApp,
            `Hi! I'd like to order "${product.name}" (${d.label}) for ${bdt(d.price)}.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ink add"
          style={{
            textDecoration: "none",
            textAlign: "center",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <MessageCircle size={16} /> Order on WhatsApp
        </a>
      ) : (
        <button
          className="btn btn-ink add"
          disabled
          style={{
            opacity: 0.5,
            cursor: "not-allowed",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Store Closed
        </button>
      )}
    </div>
  );
}

export function Shop({
  categories,
  products,
  isOpen = true,
  whatsApp = "+880",
}: {
  categories: StoreCategory[];
  products: StoreProduct[];
  isOpen?: boolean;
  whatsApp?: string;
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
              Genuine accounts &amp; upgrades. Choose a duration, order directly
              on WhatsApp, pay locally.
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
          {categories.map((c) => {
            const cover = getCategoryCover(c.coverKey, c.slug);
            return (
              <button
                key={c.id}
                className={`pill ${active === c.slug ? "active" : ""}`}
                onClick={() => setActive(c.slug)}
              >
                <span className="mini" aria-hidden="true">
                  {cover.svg}
                </span>
                {c.name}
              </button>
            );
          })}
        </div>

        <div className="grid">
          {list.length === 0 ? (
            <div className="empty-grid">No subscriptions in this category yet.</div>
          ) : (
            list.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isOpen={isOpen}
                whatsApp={whatsApp}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
