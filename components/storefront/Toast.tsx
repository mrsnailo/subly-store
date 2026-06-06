"use client";

import { useCart } from "@/components/cart/CartProvider";

export function Toast() {
  const { toast } = useCart();
  return (
    <div className={`toast ${toast ? "show" : ""}`}>
      <span className="d" />
      <span>{toast ?? "Added to cart"}</span>
    </div>
  );
}
