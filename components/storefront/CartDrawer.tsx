"use client";

import { useCart } from "@/components/cart/CartProvider";
import { bdt, getWhatsAppLink, buildCartOrderMessage } from "@/lib/format";
import { MessageCircle } from "lucide-react";

export function CartDrawer({ isOpenStore = true, whatsApp = "+880" }: { isOpenStore?: boolean; whatsApp?: string }) {
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
          {isOpenStore && items.length > 0 ? (
            <a
              href={getWhatsAppLink(whatsApp, buildCartOrderMessage(items, subtotal))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ink"
              style={{
                textDecoration: "none",
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
              className="btn btn-ink"
              disabled
              style={!isOpenStore ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              {!isOpenStore ? "Store Closed" : "Checkout with bKash →"}
            </button>
          )}
          <p className="note">🔒 Secure · Replacement warranty on all plans</p>
        </div>
      </aside>
    </>
  );
}
