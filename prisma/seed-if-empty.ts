import "dotenv/config";
import "../lib/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

// Runs the full seed only when no categories exist yet, so restarts/redeploys
// never wipe a live catalogue.
async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const count = await prisma.category.count();

  // Ensure default store settings exist even if full seed is skipped
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
    console.log("✓ Default store settings populated (seed-if-empty)");
  }

  await prisma.$disconnect();

  if (count > 0) {
    console.log(`  data present (${count} categories) — skipping seed`);
    return;
  }

  console.log("  empty database — running initial seed");
  await import("./seed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
