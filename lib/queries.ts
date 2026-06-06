import { prisma } from "@/lib/prisma";

export type StoreDuration = {
  id: string;
  label: string;
  price: number;
  wasPrice: number | null;
};

export type StoreProduct = {
  id: string;
  name: string;
  tagline: string;
  wordmark: string;
  brandColor: string;
  brandBg: string;
  rating: number;
  badgeText: string | null;
  badgeKind: string | null;
  categorySlug: string;
  durations: StoreDuration[];
};

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
};

/** Active categories (ordered) + active products with their price tiers, for the storefront. */
export async function getStorefront(): Promise<{
  categories: StoreCategory[];
  products: StoreProduct[];
}> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      products: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { durations: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  const cats: StoreCategory[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    emoji: c.emoji,
  }));

  const products: StoreProduct[] = categories.flatMap((c) =>
    c.products
      .filter((p) => p.durations.length > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        wordmark: p.wordmark,
        brandColor: p.brandColor,
        brandBg: p.brandBg,
        rating: p.rating,
        badgeText: p.badgeText,
        badgeKind: p.badgeKind,
        categorySlug: c.slug,
        durations: p.durations.map((d) => ({
          id: d.id,
          label: d.label,
          price: d.price,
          wasPrice: d.wasPrice,
        })),
      })),
  );

  return { categories: cats, products };
}
