/*
  Warnings:

  - You are about to drop the column `priceUnixTimestamp` on the `AssetPriceSpecifics` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assetId,priceTimestamp]` on the table `AssetPriceSpecifics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AssetPriceSpecifics_priceTimestamp_key";

-- DropIndex
DROP INDEX "AssetPriceSpecifics_priceUnixTimestamp_key";

-- AlterTable
ALTER TABLE "AssetPriceSpecifics" DROP COLUMN "priceUnixTimestamp";

-- CreateIndex
CREATE UNIQUE INDEX "AssetPriceSpecifics_assetId_priceTimestamp_key" ON "AssetPriceSpecifics"("assetId", "priceTimestamp");
