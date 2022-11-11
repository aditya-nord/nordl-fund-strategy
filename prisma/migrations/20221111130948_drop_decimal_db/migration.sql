/*
  Warnings:

  - You are about to drop the `AssetDecimalSpecifics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssetDecimalSpecifics" DROP CONSTRAINT "AssetDecimalSpecifics_assetId_fkey";

-- DropTable
DROP TABLE "AssetDecimalSpecifics";
