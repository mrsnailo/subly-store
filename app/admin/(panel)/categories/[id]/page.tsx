import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCategory } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Edit category</h1>
          <p>Update the name, icon or visibility.</p>
        </div>
        <a className="iconlink" href="/admin/categories">
          ← Back
        </a>
      </div>

      <div className="formcard">
        <form action={updateCategory.bind(null, category.id)}>
          <div className="row2">
            <div className="field">
              <label htmlFor="name">Category name</label>
              <input
                id="name"
                name="name"
                className="input"
                defaultValue={category.name}
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
                defaultValue={category.emoji ?? ""}
                maxLength={4}
              />
            </div>
          </div>
          <label className="checkrow">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={category.isActive}
            />
            Show this category on the store
          </label>
          <div className="actions">
            <button className="btn btn-ink">Save changes</button>
            <a className="iconlink" href="/admin/categories">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </>
  );
}
