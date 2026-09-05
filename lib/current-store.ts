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
  let slug = "default";
  try {
    const hdrs = await headers();
    const explicitSlug = hdrs.get("x-store-slug");
    if (explicitSlug) {
      slug = explicitSlug;
    } else {
      // Fallback for direct /store1 path or where middleware didn't run? 
      // Middleware should run for all non-static paths.
    }
  } catch (e) {
    // build time
  }

  const store = await getStoreBySlug(slug);
  if (store) return store.id;

  // Fallback to first store for dev / if nothing matches
  const fallback = await prisma.store.findFirst();
  return fallback?.id || "default-store-id";
}
