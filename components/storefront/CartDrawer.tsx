"use client";

import { useCart } from "@/components/cart/CartProvider";
import { bdt } from "@/lib/format";

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, removeItem } = useCart();

  return (
    <>
      <div
        className={`scrim ${isOpen ? "show" : ""}`}
        onClick={closeCart}
        aria-hidden
      />
      <aside className={`drawer ${isOpen ? "show" : ""}`}>
        <div className="dh">
          <h3>Your cart</h3>
          <button className="close" onClick={closeCart} aria-label="Close cart">
            ×
          </button>
        </div>
        <div className="ditems">
          {items.length === 0 ? (
            <div className="empty">
              Your cart is empty.
              <br />
              Add a subscription to get started ⚡
            </div>
          ) : (
            items.map((it, i) => (
              <div className="ditem" key={`${it.key}-${i}`}>
                <div
                  className="ti"
                  style={{ background: it.color, color: "#fff" }}
                >
                  {it.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="meta">
                  <b>{it.name}</b>
                  <span>{it.duration}</span>
                  <button className="rm" onClick={() => removeItem(i)}>
                    Remove
                  </button>
                </div>
                <div className="px">{bdt(it.price)}</div>
              </div>
            ))
          )}
        </div>
        <div className="dfoot">
          <div className="drow">
            <span>Subtotal</span>
            <span>{bdt(subtotal)}</span>
          </div>
          <div className="drow">
            <span>Instant delivery</span>
            <span className="accent">Free</span>
          </div>
          <div className="drow total">
            <span>Total</span>
            <span>{bdt(subtotal)}</span>
          </div>
          <button className="btn btn-ink" disabled={items.length === 0}>
            Checkout with bKash →
          </button>
          <p className="note">🔒 Secure · Replacement warranty on all plans</p>
        </div>
      </aside>
    </>
  );
}
