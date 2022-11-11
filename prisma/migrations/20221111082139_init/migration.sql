-- CreateTable
CREATE TABLE "AssetDecimalSpecifics" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "network" TEXT NOT NULL DEFAULT E'',
    "decimalPlace" INTEGER NOT NULL DEFAULT 18,
    "tokenAddress" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetDecimalSpecifics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetDetails" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "assetLogo" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "cgTokenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decimalPlace" INTEGER NOT NULL DEFAULT 18,

    CONSTRAINT "AssetDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetPriceSpecifics" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceTimestamp" TIMESTAMP(3) NOT NULL,
    "priceUnixTimestamp" INTEGER NOT NULL,

    CONSTRAINT "AssetPriceSpecifics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetDecimalSpecifics_assetId_network_key" ON "AssetDecimalSpecifics"("assetId", "network");

-- CreateIndex
CREATE UNIQUE INDEX "AssetDetails_cgTokenId_key" ON "AssetDetails"("cgTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetPriceSpecifics_priceTimestamp_key" ON "AssetPriceSpecifics"("priceTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "AssetPriceSpecifics_priceUnixTimestamp_key" ON "AssetPriceSpecifics"("priceUnixTimestamp");

-- AddForeignKey
ALTER TABLE "AssetDecimalSpecifics" ADD CONSTRAINT "AssetDecimalSpecifics_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "AssetDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetPriceSpecifics" ADD CONSTRAINT "AssetPriceSpecifics_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "AssetDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
