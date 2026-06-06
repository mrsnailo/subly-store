"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/slug";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}

async function uniqueSlug(
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
        ? await prisma.category.findUnique({ where: { slug: candidate } })
        : await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${root}-${++n}`;
  }
}

/* ──────────────────────────── Categories ──────────────────────────── */

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  emoji: z.string().max(8).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const data = categorySchema.parse({
    name: formData.get("name"),
    emoji: formData.get("emoji") ?? "",
    isActive: formData.get("isActive") === "on",
  });

  const max = await prisma.category.aggregate({ _max: { sortOrder: true } });
  await prisma.category.create({
    data: {
      name: data.name,
      slug: await uniqueSlug("category", data.name),
      emoji: data.emoji || null,
      isActive: data.isActive ?? true,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  revalidateAll();
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();
  const data = categorySchema.parse({
    name: formData.get("name"),
    emoji: formData.get("emoji") ?? "",
    isActive: formData.get("isActive") === "on",
  });
  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: await uniqueSlug("category", data.name, id),
      emoji: data.emoji || null,
      isActive: data.isActive ?? false,
    },
  });
  revalidateAll();
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } }); // cascades to products + durations
  revalidateAll();
}

export async function toggleCategory(id: string) {
  await requireAdmin();
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) return;
  await prisma.category.update({
    where: { id },
    data: { isActive: !cat.isActive },
  });
  revalidateAll();
}

/** Swap sortOrder with the neighbour in the given direction. */
export async function moveCategory(id: string, dir: "up" | "down") {
  await requireAdmin();
  const all = await prisma.category.findMany({
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
  revalidateAll();
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

/** Parse the repeated dur_label[] / dur_price[] / dur_was[] arrays from the form. */
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
  await requireAdmin();
  const data = parseProduct(formData);
  const durations = parseDurations(formData);

  const max = await prisma.product.aggregate({
    where: { categoryId: data.categoryId },
    _max: { sortOrder: true },
  });

  await prisma.product.create({
    data: {
      name: data.name,
      slug: await uniqueSlug("product", data.name),
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
        create: durations.map((d, i) => ({ ...d, sortOrder: i })),
      },
    },
  });
  revalidateAll();
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseProduct(formData);
  const durations = parseDurations(formData);

  await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: await uniqueSlug("product", data.name, id),
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
    prisma.duration.deleteMany({ where: { productId: id } }),
    prisma.duration.createMany({
      data: durations.map((d, i) => ({ ...d, productId: id, sortOrder: i })),
    }),
  ]);
  revalidateAll();
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidateAll();
}

export async function toggleProduct(id: string) {
  await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return;
  await prisma.product.update({
    where: { id },
    data: { isActive: !p.isActive },
  });
  revalidateAll();
}

export async function moveProduct(id: string, dir: "up" | "down") {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  const siblings = await prisma.product.findMany({
    where: { categoryId: product.categoryId },
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
  revalidateAll();
}
