import "dotenv/config";
import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../lib/prisma";
import { getStoreSettings, getStorefront } from "../lib/queries";
import { sanitizeWhatsAppNumber, getWhatsAppLink } from "../lib/format";

describe("StoreSettings Model", () => {
  const testStoreId = "test-store-mock-id";

  beforeAll(async () => {
    // Create a dummy store for our tests
    await prisma.store.upsert({
      where: { id: testStoreId },
      update: {},
      create: {
        id: testStoreId,
        slug: "test-store",
        name: "Test Store",
      }
    });

    const count = await prisma.storeSettings.count({ where: { storeId: testStoreId } });
    if (count === 0) {
      await prisma.storeSettings.create({
        data: { 
          storeId: testStoreId,
          storeName: "Subly Store Test",
          contactEmail: "test-owner@subly.shop",
          whatsApp: "+8801700000000",
          currency: "BDT",
          logoUrl: "/logo.svg",
          isOpen: true,
        },
      });
    }
  });

  it("should be able to retrieve the store settings", async () => {
    const settings = await prisma.storeSettings.findUnique({ where: { storeId: testStoreId } });
    expect(settings).not.toBeNull();
    expect(settings?.storeName).toBeDefined();
    expect(settings?.contactEmail).toBeDefined();
    expect(settings?.whatsApp).toBeDefined();
    expect(settings?.currency).toBeDefined();
    expect(settings?.isOpen).toBeDefined();
  });

  it("should support updating settings values", async () => {
    const original = await prisma.storeSettings.findUnique({ where: { storeId: testStoreId } });
    expect(original).not.toBeNull();

    const updated = await prisma.storeSettings.update({
      where: { id: original!.id },
      data: {
        storeName: "Updated Store Name",
        isOpen: false,
      },
    });

    expect(updated.storeName).toBe("Updated Store Name");
    expect(updated.isOpen).toBe(false);

    // Revert back
    await prisma.storeSettings.update({
      where: { id: original!.id },
      data: {
        storeName: original!.storeName,
        isOpen: original!.isOpen,
      },
    });
  });

  it("should require mandatory fields", async () => {
    await expect(
      prisma.storeSettings.create({
        data: { 
          storeId: testStoreId,
        } as any,
      })
    ).rejects.toThrow();
  });

  it("should return settings from DB or fallback if empty", async () => {
    const fromDb = await getStoreSettings(testStoreId);
    expect(fromDb.storeName).toBeDefined();

    const original = await prisma.storeSettings.findUnique({ where: { storeId: testStoreId } });
    if (original) {
      await prisma.storeSettings.delete({ where: { id: original.id } });
      const fallback = await getStoreSettings(testStoreId);
      expect(fallback.id).toBe("default-settings");
      expect(fallback.storeName).toBe("Subly Store");

      await prisma.storeSettings.create({
        data: { 
          storeId: testStoreId,
          id: original.id,
          storeName: original.storeName,
          contactEmail: original.contactEmail,
          whatsApp: original.whatsApp,
          currency: original.currency,
          logoUrl: original.logoUrl,
          isOpen: original.isOpen,
        },
      });
    }
  });

  describe("Caching and Storefront Queries", () => {
    it("should retrieve storefront catalog successfully", async () => {
      const sf = await getStorefront(testStoreId);
      expect(sf).toBeDefined();
      expect(sf.categories).toBeInstanceOf(Array);
      expect(sf.products).toBeInstanceOf(Array);
    });

    it("should retrieve settings successfully with Date objects", async () => {
      const settings = await getStoreSettings(testStoreId);
      expect(settings).toBeDefined();
      expect(settings.storeName).toBeDefined();
      expect(settings.updatedAt).toBeInstanceOf(Date);
    });
  });
});
