"use server";

import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

const settingsSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required").max(60),
  contactEmail: z.string().trim().email("Enter a valid email").max(120),
  whatsApp: z.string().trim().min(3, "WhatsApp number is required").max(32),
  currency: z.string().trim().min(1, "Currency is required").max(8),
  isOpen: z.boolean(),
});

export async function updateStoreSettings(formData: FormData) {
  await requireAdmin();

  const data = settingsSchema.parse({
    storeName: formData.get("storeName"),
    contactEmail: formData.get("contactEmail"),
    whatsApp: formData.get("whatsApp"),
    currency: formData.get("currency"),
    isOpen: formData.get("isOpen") === "on",
  });

  const existing = await prisma.storeSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });

  let logoUrl = existing?.logoUrl ?? "/logo.svg";
  let faviconUrl = existing?.faviconUrl ?? null;

  // Handle Logo Upload
  const logoFile = formData.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) {
    const blob = await put("settings/logo.png", logoFile, {
      access: "public",
      allowOverwrite: true,
      addRandomSuffix: true,
    });
    logoUrl = blob.url;

    // Delete old logo blob
    if (existing?.logoUrl && existing.logoUrl.startsWith("http") && existing.logoUrl !== blob.url) {
      try { await del(existing.logoUrl); } catch { /* ignore */ }
    }
  }

  // Handle Favicon Upload
  const faviconFile = formData.get("favicon") as File | null;
  if (faviconFile && faviconFile.size > 0) {
    const blob = await put("settings/favicon.png", faviconFile, {
      access: "public",
      allowOverwrite: true,
      addRandomSuffix: true,
    });
    faviconUrl = blob.url;

    if (existing?.faviconUrl && existing.faviconUrl.startsWith("http") && existing.faviconUrl !== blob.url) {
      try { await del(existing.faviconUrl); } catch { /* ignore */ }
    }
  }

  if (existing) {
    await prisma.storeSettings.update({
      where: { id: existing.id },
      data: {
        ...data,
        logoUrl,
        faviconUrl,
      },
    });
  } else {
    await prisma.storeSettings.create({
      data: {
        ...data,
        logoUrl,
        faviconUrl,
      },
    });
  }

  revalidateTag("store-settings", { expire: 0 });
  revalidateTag("storefront", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { ok: true } as const;
}

export async function uploadLogoAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file uploaded");
  }

  const blob = await put("settings/logo.png", file, {
    access: "public",
    allowOverwrite: true,
    addRandomSuffix: true,
  });

  const existing = await prisma.storeSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    const oldLogoUrl = existing.logoUrl;
    await prisma.storeSettings.update({
      where: { id: existing.id },
      data: { logoUrl: blob.url },
    });
    if (oldLogoUrl && oldLogoUrl.startsWith("http") && oldLogoUrl !== blob.url) {
      try { await del(oldLogoUrl); } catch { /* ignore */ }
    }
  } else {
    await prisma.storeSettings.create({
      data: {
        storeName: "Subly Store",
        contactEmail: "owner@subly.shop",
        whatsApp: "+880",
        currency: "BDT",
        isOpen: true,
        logoUrl: blob.url,
      },
    });
  }

  revalidateTag("store-settings", { expire: 0 });
  revalidateTag("storefront", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { ok: true, url: blob.url };
}

export async function uploadFaviconAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("favicon") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file uploaded");
  }

  const blob = await put("settings/favicon.png", file, {
    access: "public",
    allowOverwrite: true,
    addRandomSuffix: true,
  });

  const existing = await prisma.storeSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    const oldFaviconUrl = existing.faviconUrl;
    await prisma.storeSettings.update({
      where: { id: existing.id },
      data: { faviconUrl: blob.url },
    });
    if (oldFaviconUrl && oldFaviconUrl.startsWith("http") && oldFaviconUrl !== blob.url) {
      try { await del(oldFaviconUrl); } catch { /* ignore */ }
    }
  } else {
    await prisma.storeSettings.create({
      data: {
        storeName: "Subly Store",
        contactEmail: "owner@subly.shop",
        whatsApp: "+880",
        currency: "BDT",
        isOpen: true,
        faviconUrl: blob.url,
      },
    });
  }

  revalidateTag("store-settings", { expire: 0 });
  revalidateTag("storefront", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { ok: true, url: blob.url };
}
