import { prisma } from "@/lib/prisma";
import {
  createCategory,
  deleteCategory,
  toggleCategory,
  moveCategory,
} from "@/lib/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Categories</h1>
          <p>Add, reorder, hide and organize the categories shown on your store.</p>
        </div>
      </div>

      <div className="formcard" style={{ marginBottom: 24 }}>
        <form action={createCategory}>
          <div className="row3">
            <div className="field">
              <label htmlFor="name">Category name</label>
              <input
                id="name"
                name="name"
                className="input"
                placeholder="e.g. Gaming"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="emoji">
                Emoji <span className="hint">(optional)</span>
              </label>
              <input
                id="emoji"
                name="emoji"
                className="input"
                placeholder="🎮"
                maxLength={4}
              />
            </div>
            <div className="field" style={{ justifyContent: "flex-end" }}>
              <label style={{ visibility: "hidden" }}>Add</label>
              <button className="btn btn-ink" name="isActive" value="on">
                ＋ Add category
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-h">All categories ({categories.length})</div>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Order</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c.id}>
                <td>
                  <div className="actions">
                    <form action={moveCategory.bind(null, c.id, "up")}>
                      <button className="iconlink" disabled={i === 0}>
                        ↑
                      </button>
                    </form>
                    <form action={moveCategory.bind(null, c.id, "down")}>
                      <button
                        className="iconlink"
                        disabled={i === categories.length - 1}
                      >
                        ↓
                      </button>
                    </form>
                  </div>
                </td>
                <td>
                  <b>
                    {c.emoji ? `${c.emoji} ` : ""}
                    {c.name}
                  </b>
                </td>
                <td style={{ color: "var(--muted)" }}>{c.slug}</td>
                <td>{c._count.products}</td>
                <td>
                  <form action={toggleCategory.bind(null, c.id)}>
                    <button
                      className={`chip ${c.isActive ? "on" : "off"}`}
                      style={{ border: 0, cursor: "pointer" }}
                    >
                      {c.isActive ? "Active" : "Hidden"}
                    </button>
                  </form>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div className="actions" style={{ justifyContent: "flex-end" }}>
                    <a className="iconlink" href={`/admin/categories/${c.id}`}>
                      Edit
                    </a>
                    <ConfirmButton
                      action={deleteCategory.bind(null, c.id)}
                      confirm={`Delete "${c.name}" and its ${c._count.products} product(s)? This cannot be undone.`}
                    >
                      Delete
                    </ConfirmButton>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)" }}>
                  No categories yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
