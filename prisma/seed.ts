import "dotenv/config";
import "../lib/env";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedDuration = { label: string; price: number; wasPrice?: number };
type SeedProduct = {
  name: string;
  tagline: string;
  wordmark: string;
  brandColor: string;
  brandBg: string;
  rating: number;
  badgeText?: string;
  badgeKind?: "hot" | "save";
  featured?: boolean;
  durations: SeedDuration[];
};

const CATEGORIES: { name: string; slug: string; emoji: string; coverKey: string; products: SeedProduct[] }[] = [
  {
    name: "AI Tools",
    slug: "ai",
    emoji: "🤖",
    coverKey: "ai",
    products: [
      { name: "ChatGPT Plus", tagline: "GPT-4o · DALL·E · advanced", wordmark: "ChatGPT", brandColor: "#10A37F", brandBg: "#E7F6F1", rating: 4.9, badgeText: "Hot", badgeKind: "hot", featured: true, durations: [{ label: "1 mo", price: 299, wasPrice: 399 }, { label: "3 mo", price: 799, wasPrice: 1100 }, { label: "1 yr", price: 2899, wasPrice: 4799 }] },
      { name: "Claude Pro", tagline: "Opus · 5× usage limits", wordmark: "Claude", brandColor: "#D97757", brandBg: "#FBEEE8", rating: 4.9, durations: [{ label: "1 mo", price: 2490, wasPrice: 2900 }, { label: "3 mo", price: 6900, wasPrice: 8700 }] },
      { name: "Perplexity Pro", tagline: "Unlimited Pro searches", wordmark: "Perplexity", brandColor: "#20808D", brandBg: "#E6F1F2", rating: 4.8, badgeText: "-50%", badgeKind: "save", durations: [{ label: "1 mo", price: 199, wasPrice: 399 }, { label: "1 yr", price: 1990, wasPrice: 3990 }] },
    ],
  },
  {
    name: "Streaming",
    slug: "stream",
    emoji: "🎬",
    coverKey: "stream",
    products: [
      { name: "Netflix Premium", tagline: "4K UHD · 4 screens", wordmark: "NETFLIX", brandColor: "#E50914", brandBg: "#FDE7E8", rating: 4.9, badgeText: "Hot", badgeKind: "hot", featured: true, durations: [{ label: "1 mo", price: 380, wasPrice: 550 }, { label: "3 mo", price: 1050, wasPrice: 1650 }, { label: "1 yr", price: 3800, wasPrice: 6600 }] },
      { name: "YouTube Premium", tagline: "Ad-free · background play", wordmark: "YouTube", brandColor: "#FF0000", brandBg: "#FDE7E7", rating: 4.8, durations: [{ label: "1 mo", price: 99, wasPrice: 189 }, { label: "1 yr", price: 990, wasPrice: 2268 }] },
      { name: "Disney+ Hotstar", tagline: "Movies · sports · 4K", wordmark: "Disney+", brandColor: "#0E3FE5", brandBg: "#E5EAFD", rating: 4.7, durations: [{ label: "1 mo", price: 498, wasPrice: 699 }, { label: "1 yr", price: 4980, wasPrice: 8388 }] },
    ],
  },
  {
    name: "Music",
    slug: "music",
    emoji: "🎵",
    coverKey: "music",
    products: [
      { name: "Spotify Premium", tagline: "Ad-free · offline music", wordmark: "Spotify", brandColor: "#1DB954", brandBg: "#E5F7EC", rating: 4.9, badgeText: "-55%", badgeKind: "save", featured: true, durations: [{ label: "1 mo", price: 179, wasPrice: 399 }, { label: "3 mo", price: 480, wasPrice: 1197 }, { label: "1 yr", price: 1399, wasPrice: 4788 }] },
    ],
  },
  {
    name: "Design",
    slug: "design",
    emoji: "🎨",
    coverKey: "design",
    products: [
      { name: "Canva Pro", tagline: "Premium templates · BG remover", wordmark: "Canva", brandColor: "#7D2AE8", brandBg: "#F1E9FC", rating: 4.8, badgeText: "Hot", badgeKind: "hot", durations: [{ label: "1 mo", price: 199, wasPrice: 399 }, { label: "1 yr", price: 299, wasPrice: 4490 }] },
      { name: "Adobe Creative Cloud", tagline: "All apps · Photoshop · Premiere", wordmark: "Adobe", brandColor: "#FA0F00", brandBg: "#FDE6E5", rating: 4.7, durations: [{ label: "1 mo", price: 990, wasPrice: 1490 }, { label: "1 yr", price: 9990, wasPrice: 14999 }] },
    ],
  },
  {
    name: "Productivity",
    slug: "work",
    emoji: "💼",
    coverKey: "work",
    products: [
      { name: "Microsoft 365", tagline: "Office + 1TB OneDrive", wordmark: "Microsoft", brandColor: "#0067B8", brandBg: "#E4EEF7", rating: 4.8, badgeText: "-40%", badgeKind: "save", durations: [{ label: "1 yr", price: 499, wasPrice: 980 }] },
      { name: "Grammarly Premium", tagline: "AI writing · tone · plagiarism", wordmark: "Grammarly", brandColor: "#15C39A", brandBg: "#E4F8F2", rating: 4.7, durations: [{ label: "1 mo", price: 99, wasPrice: 299 }, { label: "1 yr", price: 990, wasPrice: 6999 }] },
      { name: "LinkedIn Premium", tagline: "Career · InMail · Learning", wordmark: "LinkedIn", brandColor: "#0A66C2", brandBg: "#E4EDF7", rating: 4.6, durations: [{ label: "1 mo", price: 799, wasPrice: 1490 }, { label: "1 yr", price: 6999, wasPrice: 14999 }] },
    ],
  },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("⚠ ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping seed (expected in preview deploys)");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: "Subly Owner" },
    create: { email, passwordHash, name: "Subly Owner" },
  });
  console.log(`✓ Admin user ready: ${email}`);

  // ── Store settings ──
  const settingsCount = await prisma.storeSettings.count();
  if (settingsCount === 0) {
    await prisma.storeSettings.create({
      data: {
        storeName: "Subly Store",
        contactEmail: "owner@subly.shop",
        whatsApp: "+8801700000000",
        currency: "BDT",
        logoUrl: "/logo.svg",
        isOpen: true,
      },
    });
    console.log("✓ Default store settings populated");
  } else {
    console.log("✓ Store settings already exist, skipping settings seed");
  }

  // ── Categories + products + durations ──
  // Clear product graph for a clean re-seed (leaves admin user intact).
  await prisma.duration.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  let catOrder = 0;
  for (const cat of CATEGORIES) {
    const category = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug, emoji: cat.emoji, coverKey: cat.coverKey, sortOrder: catOrder++ },
    });

    let prodOrder = 0;
    for (const p of cat.products) {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: slugify(p.name),
          tagline: p.tagline,
          wordmark: p.wordmark,
          brandColor: p.brandColor,
          brandBg: p.brandBg,
          rating: p.rating,
          badgeText: p.badgeText ?? null,
          badgeKind: p.badgeKind ?? null,
          isFeatured: p.featured ?? false,
          sortOrder: prodOrder++,
          categoryId: category.id,
          durations: {
            create: p.durations.map((d, i) => ({
              label: d.label,
              price: d.price,
              wasPrice: d.wasPrice ?? null,
              sortOrder: i,
            })),
          },
        },
      });
    }
    console.log(`✓ ${cat.name}: ${cat.products.length} products`);
  }

  console.log("🌱 Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
