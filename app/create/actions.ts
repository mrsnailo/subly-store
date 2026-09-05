"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";

const signupSchema = z.object({
  storeName: z.string().min(2),
  storeSlug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  password: z.string().min(6),
  whatsApp: z.string().min(8),
});

export async function createStoreAction(prevState: any, formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: "Invalid form data. Make sure slug is lowercase & alphanumeric." };
  }
  
  const { storeName, storeSlug, email, password, whatsApp } = parsed.data;

  const existingSlug = await prisma.store.findUnique({ where: { slug: storeSlug } });
  if (existingSlug) return { error: "Store URL slug is already taken." };

  const existingEmail = await prisma.adminUser.findUnique({ where: { email } });
  if (existingEmail) return { error: "Email is already registered." };

  const passwordHash = await bcrypt.hash(password, 10);

  const newStore = await prisma.store.create({
    data: {
      name: storeName,
      slug: storeSlug,
      storeSettings: {
        create: {
          storeName,
          contactEmail: email,
          whatsApp,
          currency: "BDT",
          isOpen: true,
        },
      },
      adminUsers: {
        create: {
          email,
          passwordHash,
          name: "Owner",
        },
      },
    }
  });

  // Seed minimum data so storefront works
  await prisma.category.create({
    data: {
      name: "Streaming",
      slug: "streaming",
      emoji: "🍿",
      storeId: newStore.id,
      products: {
        create: {
          name: "Netflix Premium",
          slug: "netflix-premium",
          tagline: "4K UHD · 4 Screens",
          wordmark: "NETFLIX",
          brandColor: "#E50914",
          storeId: newStore.id,
          durations: {
            create: { label: "1 month", price: 380, storeId: newStore.id }
          }
        }
      }
    }
  });

  redirect(`/${storeSlug}/admin/login?welcome=1`);
}
