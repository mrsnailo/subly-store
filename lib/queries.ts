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

export type StoreSettingsData = {
  storeName: string;
  contactEmail: string;
  whatsApp: string;
  currency: string;
  logoUrl: string | null;
  isOpen: boolean;
};

/** Retrieves the global store settings (first row). Returns a fallback default if none exists. */
export async function getStoreSettings(): Promise<StoreSettingsData> {
  const settings = await prisma.storeSettings.findFirst();
  if (settings) {
    return {
      storeName: settings.storeName,
      contactEmail: settings.contactEmail,
      whatsApp: settings.whatsApp,
      currency: settings.currency,
      logoUrl: settings.logoUrl,
      isOpen: settings.isOpen,
    };
  }
  return {
    storeName: "Subly Store",
    contactEmail: "owner@subly.shop",
    whatsApp: "+8801700000000",
    currency: "BDT",
    logoUrl: "/logo.svg",
    isOpen: true,
  };
}
