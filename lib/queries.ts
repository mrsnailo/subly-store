import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { unstable_cache } from "next/cache";

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
  coverKey: string | null;
};

/** Raw database query for storefront. */
const fetchStorefront = async () => {
  try {
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
      coverKey: c.coverKey,
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
  } catch (e) {
    return { categories: [], products: [] };
  }
};

/** Cache storefront data across requests using Next.js unstable_cache. */
const getCachedStorefront = unstable_cache(
  async () => fetchStorefront(),
  ["storefront-data"],
  { tags: ["storefront"] }
);

/** Active categories (ordered) + active products with their price tiers, for the storefront.
 * Bypasses both React cache and Next.js unstable_cache in Vitest environment.
 */
export const getStorefront = (process.env.VITEST === "true" || process.env.NODE_ENV === "test")
  ? async () => {
      return fetchStorefront();
    }
  : cache(async () => {
      return getCachedStorefront();
    });

export type StoreSettings = {
  id: string;
  storeName: string;
  contactEmail: string;
  whatsApp: string;
  currency: string;
  logoUrl: string | null;
  isOpen: boolean;
  updatedAt: Date;
};

type SerializedStoreSettings = Omit<StoreSettings, "updatedAt"> & {
  updatedAt: string;
};

/** Raw database query for store settings. */
const fetchStoreSettings = async (): Promise<SerializedStoreSettings> => {
  try {
    const settings = await prisma.storeSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (settings) {
      let logoUrl = settings.logoUrl;
      if (logoUrl && logoUrl.startsWith("/logo.png")) {
        logoUrl = `${logoUrl}?v=${settings.updatedAt.getTime()}`;
      }
      return {
        id: settings.id,
        storeName: settings.storeName,
        contactEmail: settings.contactEmail,
        whatsApp: settings.whatsApp,
        currency: settings.currency,
        logoUrl,
        isOpen: settings.isOpen,
        updatedAt: settings.updatedAt.toISOString(),
      };
    }
  } catch (e) {
    // Gracefully handle db errors during build
  }
  return {
    id: "default-settings",
    storeName: "Subly Store",
    contactEmail: "owner@subly.shop",
    whatsApp: "+8801700000000",
    currency: "BDT",
    logoUrl: "/logo.svg",
    isOpen: true,
    updatedAt: new Date().toISOString(),
  };
};

/** Cache settings data across requests using Next.js unstable_cache. */
const getCachedStoreSettings = unstable_cache(
  async () => fetchStoreSettings(),
  ["store-settings-data"],
  { tags: ["store-settings"] }
);

/** Get global store settings.
 * Deserializes updatedAt string back into a Date object.
 * Bypasses both React cache and Next.js unstable_cache in Vitest environment.
 */
export const getStoreSettings = (process.env.VITEST === "true" || process.env.NODE_ENV === "test")
  ? async (): Promise<StoreSettings> => {
      const settings = await fetchStoreSettings();
      return {
        ...settings,
        updatedAt: new Date(settings.updatedAt),
      };
    }
  : cache(async (): Promise<StoreSettings> => {
      const settings = await getCachedStoreSettings();
      return {
        ...settings,
        updatedAt: new Date(settings.updatedAt),
      };
    });
