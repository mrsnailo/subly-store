"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

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

  // Handle Logo Upload
  const logoFile = formData.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) {
    const ext = path.extname(logoFile.name).toLowerCase() || ".png";
    const logoFileName = `logo${ext}`;
    const logoPath = path.join(process.cwd(), "public", logoFileName);

    // Delete old logo files to avoid clash
    try {
      const publicDir = path.join(process.cwd(), "public");
      const files = await fs.readdir(publicDir);
      for (const file of files) {
        if (file.startsWith("logo.") && file !== logoFileName) {
          await fs.unlink(path.join(publicDir, file));
        }
      }
    } catch (e) {
      // Ignore directory read or delete errors
    }

    const bytes = await logoFile.arrayBuffer();
    await fs.writeFile(logoPath, Buffer.from(bytes));
    logoUrl = `/${logoFileName}`;
  }

  // Handle Favicon Upload
  const faviconFile = formData.get("favicon") as File | null;
  if (faviconFile && faviconFile.size > 0) {
    const ext = path.extname(faviconFile.name).toLowerCase() || ".png";
    const faviconFileName = `favicon${ext}`;
    const faviconPath = path.join(process.cwd(), "public", faviconFileName);

    // Delete old favicon files
    try {
      const publicDir = path.join(process.cwd(), "public");
      const files = await fs.readdir(publicDir);
      for (const file of files) {
        if (file.startsWith("favicon.") && file !== faviconFileName) {
          await fs.unlink(path.join(publicDir, file));
        }
      }
    } catch (e) {
      // Ignore errors
    }

    const bytes = await faviconFile.arrayBuffer();
    await fs.writeFile(faviconPath, Buffer.from(bytes));
  }

  if (existing) {
    await prisma.storeSettings.update({
      where: { id: existing.id },
      data: {
        ...data,
        logoUrl,
      },
    });
  } else {
    await prisma.storeSettings.create({
      data: {
        ...data,
        logoUrl,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { ok: true } as const;
}
