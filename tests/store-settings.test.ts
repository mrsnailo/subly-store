import "dotenv/config";
import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../lib/prisma";
import { getStoreSettings, getStorefront } from "../lib/queries";
import { sanitizeWhatsAppNumber, getWhatsAppLink } from "../lib/format";

describe("StoreSettings Model", () => {
  beforeAll(async () => {
    // Ensure we start with a default settings row
    const count = await prisma.storeSettings.count();
    if (count === 0) {
      await prisma.storeSettings.create({
        data: {
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
    const settings = await prisma.storeSettings.findFirst();
    expect(settings).not.toBeNull();
    expect(settings?.storeName).toBeDefined();
    expect(settings?.contactEmail).toBeDefined();
    expect(settings?.whatsApp).toBeDefined();
    expect(settings?.currency).toBeDefined();
    expect(settings?.isOpen).toBeDefined();
  });

  it("should support updating settings values", async () => {
    const original = await prisma.storeSettings.findFirst();
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
    // Attempting to create settings with missing mandatory fields should fail
    await expect(
      prisma.storeSettings.create({
        data: {
          // Missing storeName, contactEmail, whatsApp
        } as any,
      })
    ).rejects.toThrow();
  });

  it("should return settings from DB or fallback if empty", async () => {
    const fromDb = await getStoreSettings();
    expect(fromDb.storeName).toBeDefined();

    // Temporarily clear DB row
    const original = await prisma.storeSettings.findFirst();
    if (original) {
      await prisma.storeSettings.delete({ where: { id: original.id } });
      const fallback = await getStoreSettings();
      expect(fallback.id).toBe("default-settings");
      expect(fallback.storeName).toBe("Subly Store");

      // Restore it
      await prisma.storeSettings.create({
        data: {
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
      const sf = await getStorefront();
      expect(sf).toBeDefined();
      expect(sf.categories).toBeInstanceOf(Array);
      expect(sf.products).toBeInstanceOf(Array);
    });

    it("should retrieve settings successfully with Date objects", async () => {
      const settings = await getStoreSettings();
      expect(settings).toBeDefined();
      expect(settings.storeName).toBeDefined();
      expect(settings.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("WhatsApp Sanitizer Helpers", () => {
    it("should sanitize WhatsApp number correctly", () => {
      expect(sanitizeWhatsAppNumber("+8801700000000")).toBe("8801700000000");
      expect(sanitizeWhatsAppNumber("008801700000000")).toBe("8801700000000");
      expect(sanitizeWhatsAppNumber("+00-880-1700-0000")).toBe("88017000000");
      expect(sanitizeWhatsAppNumber("123-456 789")).toBe("123456789");
    });

    it("should generate deep links correctly", () => {
      expect(getWhatsAppLink("+8801700000000")).toBe("https://wa.me/8801700000000");
      expect(getWhatsAppLink("008801700000000", "Hello there!")).toBe(
        "https://wa.me/8801700000000?text=Hello%20there!"
      );
    });
  });
});
