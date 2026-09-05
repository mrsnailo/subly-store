"use client";

import { useActionState } from "react";
import { createStoreAction } from "./actions";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function CreateStorePage() {
  const [state, formAction, isPending] = useActionState(createStoreAction, null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f9fafb" }}>
      <header style={{ padding: "20px", display: "flex", justifyContent: "center", background: "#fff", borderBottom: "1px solid #eee" }}>
        <Logo storeName="Subly" logoUrl={null} />
      </header>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <form action={formAction} style={{ background: "#fff", padding: "32px", borderRadius: "12px", border: "1px solid #eaeaea", width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Create your store</h1>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>Start selling digital subscriptions in minutes.</p>
          </div>

          {state?.error && (
            <div style={{ padding: "12px", background: "#fef2f2", color: "#dc2626", borderRadius: "6px", fontSize: "14px", border: "1px solid #fecaca" }}>
              {state.error}
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Store Name</label>
            <input name="storeName" required placeholder="My Store" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Store URL Slug</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input name="storeSlug" required pattern="[a-z0-9-]+" placeholder="my-store" style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
              <span style={{ color: "#6b7280", fontSize: "14px" }}>.subly.store</span>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>WhatsApp Number (for orders)</label>
            <input name="whatsApp" required placeholder="+8801700000000" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Admin Email</label>
            <input type="email" name="email" required placeholder="admin@example.com" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Password</label>
            <input type="password" name="password" required minLength={6} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
          </div>

          <button type="submit" disabled={isPending} style={{ background: "#000", color: "#fff", padding: "12px", borderRadius: "6px", fontWeight: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", border: "none", cursor: "pointer", marginTop: "8px" }}>
            {isPending ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : "Create Store"}
          </button>
        </form>
      </main>
    </div>
  );
}
