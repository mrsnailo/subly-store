"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/slug";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !(session.user as any).storeId) throw new Error("Unauthorized");
  return { ...session.user, storeId: (session.user as any).storeId as string };
}

function revalidateAll(storeId: string) {
  revalidateTag(`storefront-${storeId}`, { expire: 0 } as any);
  revalidateTag(`store-settings-${storeId}`, { expire: 0 } as any);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/settings");
}

async function uniqueSlug(
  storeId: string,
  table: "category" | "product",
  base: string,
  ignoreId?: string,
) {
  const root = slugify(base) || "item";
  let candidate = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing =
      table === "category"
        ? await prisma.category.findUnique({ where: { storeId_slug: { storeId, slug: candidate } } })
        : await prisma.product.findUnique({ where: { storeId_slug: { storeId, slug: candidate } } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${root}-${++n}`;
  }
}

/* ──────────────────────────── Categories ──────────────────────────── */

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  emoji: z.string().max(8).optional().or(z.literal("")),
  coverKey: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function createCategory(formData: FormData) {
  const { storeId } = await requireAdmin();
  const data = categorySchema.parse({
    name: formData.get("name"),
    emoji: formData.get("emoji") ?? "",
    coverKey: formData.get("coverKey") ?? "",
    isActive: formData.get("isActive") === "on",
  });

  const max = await prisma.category.aggregate({
    where: { storeId },
    _max: { sortOrder: true }
  });
  
  await prisma.category.create({
    data: {
      storeId,
      name: data.name,
      slug: await uniqueSlug(storeId, "category", data.name),
      emoji: data.emoji || null,
      coverKey: data.coverKey || null,
      isActive: data.isActive ?? true,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  revalidateAll(storeId);
}

export async function updateCategory(id: string, formData: FormData) {
  const { storeId } = await requireAdmin();
  const data = categorySchema.parse({
    name: formData.get("name"),
    emoji: formData.get("emoji") ?? "",
    coverKey: formData.get("coverKey") ?? "",
    isActive: formData.get("isActive") === "on",
  });
  
  // verify ownership
  const cat = await prisma.category.findFirst({ where: { id, storeId } });
  if (!cat) throw new Error("Category not found");

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: await uniqueSlug(storeId, "category", data.name, id),
      emoji: data.emoji || null,
      coverKey: data.coverKey || null,
      isActive: data.isActive ?? false,
    },
  });
  revalidateAll(storeId);
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  const { storeId } = await requireAdmin();
  const cat = await prisma.category.findFirst({ where: { id, storeId } });
  if (!cat) return;
  
  await prisma.category.delete({ where: { id } }); // cascades
  revalidateAll(storeId);
}

export async function toggleCategory(id: string) {
  const { storeId } = await requireAdmin();
  const cat = await prisma.category.findFirst({ where: { id, storeId } });
  if (!cat) return;
  await prisma.category.update({
    where: { id },
    data: { isActive: !cat.isActive },
  });
  revalidateAll(storeId);
}

export async function moveCategory(id: string, dir: "up" | "down") {
  const { storeId } = await requireAdmin();
  const all = await prisma.category.findMany({
    where: { storeId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return;

  const a = all[idx];
  const b = all[swapIdx];
  await prisma.$transaction([
    prisma.category.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.category.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  revalidateAll(storeId);
}

/* ──────────────────────────── Products ──────────────────────────── */

const durationSchema = z.object({
  label: z.string().min(1),
  price: z.coerce.number().int().min(0),
  wasPrice: z.coerce.number().int().min(0).optional().nullable(),
});

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  tagline: z.string().min(1, "Tagline is required").max(120),
  categoryId: z.string().min(1, "Pick a category"),
  wordmark: z.string().min(1).max(40),
  brandColor: z.string().min(1),
  brandBg: z.string().min(1),
  rating: z.coerce.number().min(0).max(5),
  badgeText: z.string().max(20).optional().or(z.literal("")),
  badgeKind: z.enum(["hot", "save", ""]).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

function parseDurations(formData: FormData) {
  const labels = formData.getAll("dur_label").map(String);
  const prices = formData.getAll("dur_price").map(String);
  const wases = formData.getAll("dur_was").map(String);
  const out: { label: string; price: number; wasPrice: number | null }[] = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]?.trim();
    if (!label) continue;
    const parsed = durationSchema.parse({
      label,
      price: prices[i] || 0,
      wasPrice: wases[i] ? wases[i] : null,
    });
    out.push({
      label: parsed.label,
      price: parsed.price,
      wasPrice: parsed.wasPrice ?? null,
    });
  }
  if (out.length === 0) throw new Error("Add at least one duration/price tier");
  return out;
}

function parseProduct(formData: FormData) {
  return productSchema.parse({
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    categoryId: formData.get("categoryId"),
    wordmark: formData.get("wordmark"),
    brandColor: formData.get("brandColor"),
    brandBg: formData.get("brandBg"),
    rating: formData.get("rating") ?? 4.8,
    badgeText: formData.get("badgeText") ?? "",
    badgeKind: (formData.get("badgeKind") as string) ?? "",
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
  });
}

export async function createProduct(formData: FormData) {
  const { storeId } = await requireAdmin();
  const data = parseProduct(formData);
  const durations = parseDurations(formData);

  const cat = await prisma.category.findFirst({ where: { id: data.categoryId, storeId } });
  if (!cat) throw new Error("Category not found");

  const max = await prisma.product.aggregate({
    where: { categoryId: data.categoryId, storeId },
    _max: { sortOrder: true },
  });

  await prisma.product.create({
    data: {
      storeId,
      name: data.name,
      slug: await uniqueSlug(storeId, "product", data.name),
      tagline: data.tagline,
      categoryId: data.categoryId,
      wordmark: data.wordmark,
      brandColor: data.brandColor,
      brandBg: data.brandBg,
      rating: data.rating,
      badgeText: data.badgeText || null,
      badgeKind: data.badgeKind || null,
      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive ?? true,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
      durations: {
        create: durations.map((d, i) => ({ ...d, storeId, sortOrder: i })),
      },
    },
  });
  revalidateAll(storeId);
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const { storeId } = await requireAdmin();
  const data = parseProduct(formData);
  const durations = parseDurations(formData);

  const prod = await prisma.product.findFirst({ where: { id, storeId } });
  if (!prod) throw new Error("Product not found");

  const cat = await prisma.category.findFirst({ where: { id: data.categoryId, storeId } });
  if (!cat) throw new Error("Category not found");

  await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: await uniqueSlug(storeId, "product", data.name, id),
        tagline: data.tagline,
        categoryId: data.categoryId,
        wordmark: data.wordmark,
        brandColor: data.brandColor,
        brandBg: data.brandBg,
        rating: data.rating,
        badgeText: data.badgeText || null,
        badgeKind: data.badgeKind || null,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? false,
      },
    }),
    prisma.duration.deleteMany({ where: { productId: id, storeId } }),
    prisma.duration.createMany({
      data: durations.map((d, i) => ({ ...d, productId: id, storeId, sortOrder: i })),
    }),
  ]);
  revalidateAll(storeId);
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const { storeId } = await requireAdmin();
  const prod = await prisma.product.findFirst({ where: { id, storeId } });
  if (!prod) return;
  await prisma.product.delete({ where: { id } });
  revalidateAll(storeId);
}

export async function toggleProduct(id: string) {
  const { storeId } = await requireAdmin();
  const p = await prisma.product.findFirst({ where: { id, storeId } });
  if (!p) return;
  await prisma.product.update({
    where: { id },
    data: { isActive: !p.isActive },
  });
  revalidateAll(storeId);
}

export async function moveProduct(id: string, dir: "up" | "down") {
  const { storeId } = await requireAdmin();
  const product = await prisma.product.findFirst({ where: { id, storeId } });
  if (!product) return;
  const siblings = await prisma.product.findMany({
    where: { categoryId: product.categoryId, storeId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const idx = siblings.findIndex((p) => p.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return;

  const a = siblings[idx];
  const b = siblings[swapIdx];
  await prisma.$transaction([
    prisma.product.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.product.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  revalidateAll(storeId);
}

/* ──────────────────────────── Store Creation ──────────────────────────── */

const storeCreationSchema = z.object({
  storeName: z.string().min(1).max(100),
  slug: z.string().min(3).max(63).regex(/^[a-z0-9-]+$/),
  currency: z.string().min(3).max(3).toUpperCase().default("BDT"),
  whatsApp: z.string().min(1).max(20),
  contactEmail: z.string().email(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  adminName: z.string().optional(),
});

export async function createStore(formData: FormData) {
  // Free action for self-serve store creation
  const data = storeCreationSchema.parse({
    storeName: formData.get("storeName"),
    slug: formData.get("slug"),
    currency: formData.get("currency") || "BDT",
    whatsApp: formData.get("whatsApp"),
    contactEmail: formData.get("contactEmail"),
    adminEmail: formData.get("adminEmail"),
    adminPassword: formData.get("adminPassword"),
    adminName: formData.get("adminName"),
  });

  const existingStore = await prisma.store.findUnique({ where: { slug: data.slug } });
  if (existingStore) throw new Error("Store subdomain is already taken.");

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(data.adminPassword, 12);

  const store = await prisma.store.create({
    data: {
      name: data.storeName,
      slug: data.slug,
      storeSettings: {
        create: {
          storeName: data.storeName,
          currency: data.currency,
          whatsApp: data.whatsApp,
          contactEmail: data.contactEmail,
        }
      },
      adminUsers: {
        create: {
          email: data.adminEmail,
          passwordHash,
          name: data.adminName || null,
        }
      }
    }
  });

  return { storeId: store.id, slug: store.slug };
}
