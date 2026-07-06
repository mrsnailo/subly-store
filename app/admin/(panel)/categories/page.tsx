import { prisma } from "@/lib/prisma";
import {
  createCategory,
  deleteCategory,
  toggleCategory,
  moveCategory,
} from "@/lib/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getCategoryCover } from "@/lib/category-covers";

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
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.6fr 1.2fr auto", gap: 14, alignItems: "end" }}>
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
            <div className="field">
              <label htmlFor="coverKey">
                Cover Key <span className="hint">(optional)</span>
              </label>
              <select
                id="coverKey"
                name="coverKey"
                className="select"
                defaultValue=""
              >
                <option value="">Default (Folder icon)</option>
                <option value="ai">AI Tools</option>
                <option value="stream">Streaming</option>
                <option value="music">Music</option>
                <option value="design">Design</option>
                <option value="work">Productivity</option>
                <option value="security">Security</option>
                <option value="gaming">Gaming</option>
                <option value="education">Education</option>
                <option value="tools">Utilities</option>
              </select>
            </div>
            <div className="field">
              <button className="btn btn-ink" name="isActive" value="on" style={{ height: 42 }}>
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
                <td style={{ verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "rgba(20, 25, 40, 0.03)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--ink)",
                      flexShrink: 0
                    }}>
                      <div style={{ width: 18, height: 18 }}>
                        {getCategoryCover(c.coverKey, c.slug).svg}
                      </div>
                    </div>
                    <div>
                      <b style={{ display: "block" }}>{c.name}</b>
                      {c.emoji && <span className="hint" style={{ fontSize: 12 }}>Emoji: {c.emoji}</span>}
                    </div>
                  </div>
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
