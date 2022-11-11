/*
  Warnings:

  - You are about to drop the column `assetLogo` on the `AssetDetails` table. All the data in the column will be lost.
  - You are about to drop the column `decimalPlace` on the `AssetDetails` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `AssetDetails` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AssetDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssetDetails" DROP COLUMN "assetLogo",
DROP COLUMN "decimalPlace",
DROP COLUMN "price",
DROP COLUMN "updatedAt";
