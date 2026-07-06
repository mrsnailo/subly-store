"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

  if (existing) {
    await prisma.storeSettings.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.storeSettings.create({
      data: {
        ...data,
        logoUrl: "/logo.svg",
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { ok: true } as const;
}
