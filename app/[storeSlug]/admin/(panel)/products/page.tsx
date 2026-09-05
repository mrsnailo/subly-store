import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bdt } from "@/lib/format";
import {
  deleteProduct,
  toggleProduct,
  moveProduct,
} from "@/lib/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      products: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { durations: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  const total = categories.reduce((n, c) => n + c.products.length, 0);

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Products</h1>
          <p>Manage subscriptions, pricing tiers and what shows on the store.</p>
        </div>
        <div className="actions">
          <Link href="/admin/products/new" className="btn btn-ink btn-sm">
            ＋ New product
          </Link>
        </div>
      </div>

      {total === 0 && (
        <div className="panel" style={{ padding: 28, color: "var(--muted)" }}>
          No products yet. <Link href="/admin/products/new">Create one →</Link>
        </div>
      )}

      {categories.map((cat) => (
        <div className="panel" style={{ marginBottom: 22 }} key={cat.id}>
          <div className="panel-h">
            <span>
              {cat.emoji ? `${cat.emoji} ` : ""}
              {cat.name}
            </span>
            <span className="chip">{cat.products.length} products</span>
          </div>
          {cat.products.length === 0 ? (
            <div style={{ padding: "18px 22px", color: "var(--muted)", fontSize: 14 }}>
              No products in this category yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Order</th>
                    <th>Product</th>
                    <th>Tiers</th>
                    <th>From</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.products.map((p, i) => (
                    <tr key={p.id}>
                      <td>
                        <div className="actions">
                          <form action={moveProduct.bind(null, p.id, "up")}>
                            <button className="iconlink" disabled={i === 0}>
                              ↑
                            </button>
                          </form>
                          <form action={moveProduct.bind(null, p.id, "down")}>
                            <button
                              className="iconlink"
                              disabled={i === cat.products.length - 1}
                            >
                              ↓
                            </button>
                          </form>
                        </div>
                      </td>
                      <td>
                        <span className="brand-mini">
                          <span className="wm" style={{ color: p.brandColor }}>
                            {p.wordmark}
                          </span>
                          <span>
                            <b>{p.name}</b>
                            <br />
                            <span style={{ color: "var(--muted)", fontSize: 12 }}>
                              {p.tagline}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td>{p.durations.length}</td>
                      <td>
                        {p.durations[0] ? bdt(p.durations[0].price) : "—"}
                      </td>
                      <td>
                        <form action={toggleProduct.bind(null, p.id)}>
                          <button
                            className={`chip ${p.isActive ? "on" : "off"}`}
                            style={{ border: 0, cursor: "pointer" }}
                          >
                            {p.isActive ? "Live" : "Hidden"}
                          </button>
                        </form>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="actions" style={{ justifyContent: "flex-end" }}>
                          <a className="iconlink" href={`/admin/products/${p.id}`}>
                            Edit
                          </a>
                          <ConfirmButton
                            action={deleteProduct.bind(null, p.id)}
                            confirm={`Delete "${p.name}"? This cannot be undone.`}
                          >
                            Delete
                          </ConfirmButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
