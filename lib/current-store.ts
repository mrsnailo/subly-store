import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getStoreBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.store.findUnique({ where: { slug } });
  },
  ["store-by-slug"],
  { tags: ["stores"] }
);

export async function getCurrentStoreId(): Promise<string> {
  let host = "";
  try {
    const hdrs = await headers();
    host = hdrs.get("host") || "";
  } catch (e) {
    // build time etc
  }

  // e.g. "my-store.subly.shop" -> "my-store", "localhost:3000" -> "localhost"
  let slug = host.split(".")[0] || "default";
  
  if (host === "localhost" || host.startsWith("localhost:")) {
    slug = "default";
  }

  const store = await getStoreBySlug(slug);
  if (store) return store.id;

  // Fallback to first store for dev / if nothing matches
  const fallback = await prisma.store.findFirst();
  return fallback?.id || "default-store-id";
}
