import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "../lib/prisma";
import { updateCategory, deleteCategory, updateProduct, deleteProduct, createCategory, createProduct } from "../lib/actions";

// Mock the auth module to control which tenant is "logged in"
vi.mock("@/auth", () => ({
  auth: vi.fn()
}));
import { auth } from "@/auth";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn()
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

describe("Tenant Isolation (Security)", () => {
  const tenantAId = "tenant-a-store";
  const tenantBId = "tenant-b-store";
  
  let tenantACatId: string;
  let tenantBCatId: string;
  let tenantAProdId: string;
  let tenantBProdId: string;

  beforeAll(async () => {
    // Provision Tenant A
    await prisma.store.upsert({
      where: { id: tenantAId },
      update: {},
      create: { id: tenantAId, slug: "store-a", name: "Store A" }
    });
    const catA = await prisma.category.create({
      data: { storeId: tenantAId, name: "Cat A", slug: "cat-a", sortOrder: 1 }
    });
    tenantACatId = catA.id;
    const prodA = await prisma.product.create({
      data: { storeId: tenantAId, categoryId: catA.id, name: "Prod A", slug: "prod-a", sortOrder: 1, tagline: "", wordmark: "" }
    });
    tenantAProdId = prodA.id;
    await prisma.storeSettings.create({
      data: { storeId: tenantAId, storeName: "Store A", contactEmail: "a@a.com", whatsApp: "1234", currency: "USD" }
    });

    // Provision Tenant B
    await prisma.store.upsert({
      where: { id: tenantBId },
      update: {},
      create: { id: tenantBId, slug: "store-b", name: "Store B" }
    });
    const catB = await prisma.category.create({
      data: { storeId: tenantBId, name: "Cat B", slug: "cat-b", sortOrder: 1 }
    });
    tenantBCatId = catB.id;
    const prodB = await prisma.product.create({
      data: { storeId: tenantBId, categoryId: catB.id, name: "Prod B", slug: "prod-b", sortOrder: 1, tagline: "", wordmark: "" }
    });
    tenantBProdId = prodB.id;
    await prisma.storeSettings.create({
      data: { storeId: tenantBId, storeName: "Store B", contactEmail: "b@b.com", whatsApp: "2345", currency: "USD" }
    });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  const loginAsTenantA = () => {
    (auth as any).mockResolvedValue({
      user: { id: "user-a", email: "a@a.com", storeId: tenantAId }
    });
  };

  it("Tenant A can modify Tenant A's category", async () => {
    loginAsTenantA();
    const fd = new FormData();
    fd.set("name", "Cat A Updated");
    await updateCategory(tenantACatId, fd);
    
    // Verify
    const updated = await prisma.category.findUnique({ where: { id: tenantACatId } });
    expect(updated?.name).toBe("Cat A Updated");
  });

  it("Tenant A CANNOT modify Tenant B's category", async () => {
    loginAsTenantA();
    const fd = new FormData();
    fd.set("name", "Hacked By A");
    
    // updateCategory throws "Category not found" on unauthorized access
    await expect(updateCategory(tenantBCatId, fd)).rejects.toThrow("Category not found");
    
    // Verify nothing changed
    const unchanged = await prisma.category.findUnique({ where: { id: tenantBCatId } });
    expect(unchanged?.name).toBe("Cat B");
  });

  it("Tenant A CANNOT delete Tenant B's category", async () => {
    loginAsTenantA();
    
    try {
      await deleteCategory(tenantBCatId);
    } catch(e) {
      // action might return silently or throw
    }
    
    // Verify it still exists
    const stillExists = await prisma.category.findUnique({ where: { id: tenantBCatId } });
    expect(stillExists).toBeTruthy();
  });

  it("Tenant A CANNOT modify Tenant B's product", async () => {
    loginAsTenantA();
    const fd = new FormData();
    fd.set("categoryId", tenantBCatId);
    fd.set("name", "Hacked Product");
    fd.set("tagline", "hacked");
    fd.set("wordmark", "hacked");
    fd.set("brandColor", "#000000");
    fd.set("brandBg", "#000000");
    fd.set("dur_label", "1 month");
    fd.set("dur_price", "100.00");
    fd.set("dur_was", "120.00");
    
    await expect(updateProduct(tenantBProdId, fd)).rejects.toThrow("Product not found");
    
    const unchanged = await prisma.product.findUnique({ where: { id: tenantBProdId } });
    expect(unchanged?.name).toBe("Prod B");
  });

  it("Tenant A CANNOT delete Tenant B's product", async () => {
    loginAsTenantA();
    
    try {
      await deleteProduct(tenantBProdId);
    } catch(e) {
      // action might return return silently or throw
    }
    
    const stillExists = await prisma.product.findUnique({ where: { id: tenantBProdId } });
    expect(stillExists).toBeTruthy();
  });
});
