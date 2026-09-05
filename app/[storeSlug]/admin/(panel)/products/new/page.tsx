import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProduct } from "@/lib/actions";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>New product</h1>
          <p>Add a subscription with one or more duration/price tiers.</p>
        </div>
        <a className="iconlink" href="/admin/products">
          ← Back
        </a>
      </div>

      {categories.length === 0 ? (
        <div className="panel" style={{ padding: 28, color: "var(--muted)" }}>
          You need a category first.{" "}
          <Link href="/admin/categories">Create a category →</Link>
        </div>
      ) : (
        <ProductForm
          action={createProduct}
          categories={categories}
          submitLabel="Create product"
        />
      )}
    </>
  );
}
