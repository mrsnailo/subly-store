import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bdt } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [catCount, prodCount, activeProd, durAgg, recent] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.duration.aggregate({ _min: { price: true } }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { category: true, durations: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your Subly store.</p>
        </div>
        <div className="actions">
          <Link href="/admin/products/new" className="btn btn-ink btn-sm">
            ＋ New product
          </Link>
          <a href="/" target="_blank" className="iconlink">
            View store ↗
          </a>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="v">{catCount}</div>
          <div className="k">Categories</div>
        </div>
        <div className="stat">
          <div className="v">{prodCount}</div>
          <div className="k">Products</div>
        </div>
        <div className="stat">
          <div className="v">{activeProd}</div>
          <div className="k">Live on store</div>
        </div>
        <div className="stat">
          <div className="v">
            {durAgg._min.price != null ? bdt(durAgg._min.price) : "—"}
          </div>
          <div className="k">Lowest price</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">Recently updated</div>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>From</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((p) => {
              const from = p.durations[0]?.price;
              return (
                <tr key={p.id}>
                  <td>
                    <span className="brand-mini">
                      <span className="wm" style={{ color: p.brandColor }}>
                        {p.wordmark}
                      </span>
                      {p.name}
                    </span>
                  </td>
                  <td>{p.category.name}</td>
                  <td>{from != null ? bdt(from) : "—"}</td>
                  <td>
                    <span className={`chip ${p.isActive ? "on" : "off"}`}>
                      {p.isActive ? "Live" : "Hidden"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--muted)" }}>
                  No products yet. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
