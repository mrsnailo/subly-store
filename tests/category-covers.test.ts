import "dotenv/config";
import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../lib/prisma";
import { getStorefront } from "../lib/queries";
import { getCategoryCover } from "../lib/category-covers";

describe("Category Cover System", () => {
  beforeAll(async () => {
    // Clear any categories to make a clean run
    await prisma.duration.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  });

  describe("getCategoryCover helper", () => {
    it("should resolve correct cover info for valid coverKey", () => {
      const cover = getCategoryCover("ai");
      expect(cover.key).toBe("ai");
      expect(cover.label).toBe("AI Tools");
      expect(cover.svg).toBeDefined();
    });

    it("should fallback to slug mapping if coverKey is missing/null/undefined", () => {
      const cover = getCategoryCover(null, "music");
      expect(cover.key).toBe("music");
      expect(cover.label).toBe("Music");
    });

    it("should fallback to default cover if coverKey is invalid", () => {
      const cover = getCategoryCover("invalid-key", "random-slug");
      expect(cover.key).toBe("default");
      expect(cover.label).toBe("Default");
    });

    it("should fallback to default if both coverKey and slug are missing/invalid", () => {
      const cover = getCategoryCover("", "");
      expect(cover.key).toBe("default");
    });
  });

  describe("Prisma & Queries Integration", () => {
    it("should persist coverKey and return it via getStorefront()", async () => {
      // 1. Create a category with a coverKey
      const cat = await prisma.category.create({
        data: {
          name: "Test AI",
          slug: "test-ai",
          coverKey: "ai",
          emoji: "🤖",
        },
      });

      expect(cat.coverKey).toBe("ai");

      // 2. Retrieve storefront
      const sf = await getStorefront();
      const testCat = sf.categories.find((c) => c.id === cat.id);
      expect(testCat).toBeDefined();
      expect(testCat?.coverKey).toBe("ai");

      // 3. Update category coverKey
      const updated = await prisma.category.update({
        where: { id: cat.id },
        data: { coverKey: "stream" },
      });
      expect(updated.coverKey).toBe("stream");

      // 4. Update to null (fallback scenario)
      const updatedNull = await prisma.category.update({
        where: { id: cat.id },
        data: { coverKey: null },
      });
      expect(updatedNull.coverKey).toBeNull();
    });
  });
});
