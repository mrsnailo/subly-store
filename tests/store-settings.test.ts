import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma";

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
});
