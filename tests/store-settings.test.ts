import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import { getStoreSettings } from "../lib/queries";
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

  describe("getStoreSettings helper", () => {
    it("should return configured store settings if they exist", async () => {
      const dbSettings = await prisma.storeSettings.findFirst();
      expect(dbSettings).not.toBeNull();

      const settings = await getStoreSettings();
      expect(settings.storeName).toBe(dbSettings!.storeName);
      expect(settings.contactEmail).toBe(dbSettings!.contactEmail);
      expect(settings.whatsApp).toBe(dbSettings!.whatsApp);
      expect(settings.currency).toBe(dbSettings!.currency);
      expect(settings.isOpen).toBe(dbSettings!.isOpen);
    });

    it("should return fallback settings if DB has no settings", async () => {
      // Temporarily store existing settings
      const existing = await prisma.storeSettings.findMany();
      await prisma.storeSettings.deleteMany();

      try {
        const settings = await getStoreSettings();
        expect(settings.storeName).toBe("Subly Store");
        expect(settings.contactEmail).toBe("owner@subly.shop");
        expect(settings.whatsApp).toBe("+8801700000000");
        expect(settings.isOpen).toBe(true);
      } finally {
        // Restore settings
        if (existing.length > 0) {
          await prisma.storeSettings.createMany({ data: existing });
        }
      }
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

