/*
  Warnings:

  - A unique constraint covering the columns `[storeId,slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId]` on the table `StoreSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `AdminUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Duration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `StoreSettings` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable First
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- Insert default store
INSERT INTO "Store" ("id", "slug", "name") VALUES ('default-store-id', 'default', 'Default Store') ON CONFLICT DO NOTHING;

-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "Product_slug_key";

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "storeId" TEXT DEFAULT 'default-store-id';
UPDATE "AdminUser" SET "storeId" = 'default-store-id' WHERE "storeId" IS NULL;
ALTER TABLE "AdminUser" ALTER COLUMN "storeId" DROP DEFAULT;
ALTER TABLE "AdminUser" ALTER COLUMN "storeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "storeId" TEXT DEFAULT 'default-store-id';
UPDATE "Category" SET "storeId" = 'default-store-id' WHERE "storeId" IS NULL;
ALTER TABLE "Category" ALTER COLUMN "storeId" DROP DEFAULT;
ALTER TABLE "Category" ALTER COLUMN "storeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Duration" ADD COLUMN "storeId" TEXT DEFAULT 'default-store-id';
UPDATE "Duration" SET "storeId" = 'default-store-id' WHERE "storeId" IS NULL;
ALTER TABLE "Duration" ALTER COLUMN "storeId" DROP DEFAULT;
ALTER TABLE "Duration" ALTER COLUMN "storeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "storeId" TEXT DEFAULT 'default-store-id';
UPDATE "Product" SET "storeId" = 'default-store-id' WHERE "storeId" IS NULL;
ALTER TABLE "Product" ALTER COLUMN "storeId" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "storeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN "storeId" TEXT DEFAULT 'default-store-id';
UPDATE "StoreSettings" SET "storeId" = 'default-store-id' WHERE "storeId" IS NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "storeId" DROP DEFAULT;
ALTER TABLE "StoreSettings" ALTER COLUMN "storeId" SET NOT NULL;


-- CreateIndex
CREATE INDEX "AdminUser_storeId_idx" ON "AdminUser"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_storeId_slug_key" ON "Category"("storeId", "slug");

-- CreateIndex
CREATE INDEX "Duration_storeId_idx" ON "Duration"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_slug_key" ON "Product"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_storeId_key" ON "StoreSettings"("storeId");

-- CreateIndex
CREATE INDEX "StoreSettings_storeId_idx" ON "StoreSettings"("storeId");

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duration" ADD CONSTRAINT "Duration_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreSettings" ADD CONSTRAINT "StoreSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
