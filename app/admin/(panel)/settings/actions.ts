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
    const ext = logoFile.name.substring(logoFile.name.lastIndexOf(".")).toLowerCase() || ".png";
    const blob = await put(`store/logo${ext}`, logoFile, {
      access: "public",
      addRandomSuffix: false,
    });
    logoUrl = blob.url;

    // Delete old logo blob if the extension changed
    if (existing?.logoUrl && existing.logoUrl !== blob.url) {
      try { await del(existing.logoUrl); } catch { /* ignore */ }
    }
  }

  // Handle Favicon Upload
  const faviconFile = formData.get("favicon") as File | null;
  if (faviconFile && faviconFile.size > 0) {
    const ext = faviconFile.name.substring(faviconFile.name.lastIndexOf(".")).toLowerCase() || ".png";
    const blob = await put(`store/favicon${ext}`, faviconFile, {
      access: "public",
      addRandomSuffix: false,
    });
    faviconUrl = blob.url;

    if (existing?.faviconUrl && existing.faviconUrl !== blob.url) {
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
