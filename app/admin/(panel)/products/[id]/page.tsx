import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { durations: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Edit product</h1>
          <p>{product.name}</p>
        </div>
        <a className="iconlink" href="/admin/products">
          ← Back
        </a>
      </div>

      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        submitLabel="Save changes"
        product={{
          name: product.name,
          tagline: product.tagline,
          categoryId: product.categoryId,
          wordmark: product.wordmark,
          brandColor: product.brandColor,
          brandBg: product.brandBg,
          rating: product.rating,
          badgeText: product.badgeText,
          badgeKind: product.badgeKind,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          durations: product.durations.map((d) => ({
            label: d.label,
            price: d.price,
            wasPrice: d.wasPrice,
          })),
        }}
      />
    </>
  );
}
