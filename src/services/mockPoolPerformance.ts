import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import findAssetDetailsByCGID from "../repository/findAssetDetailsByCGID";
import findAssetPriceOnDate from "../repository/findAssetPriceOnDate";

export interface PoolAssets {
    assetAllocationPercent: number,
    assetId: string
}

const mockPoolPerformance = async (assets: PoolAssets[], numberOfDays: number, amountInUSD: number) => {
    try {

        let totalAlloc = 0;
        for (let i = 0; i < assets.length; i++) {
            totalAlloc += assets[i].assetAllocationPercent
        }
        if (totalAlloc !== 100) {
            throw new Error("Allocation Percentage does not add up to 100%");
        }

        const diffInUTC = dayjs().utcOffset();
        const beginDate = dayjs().subtract(numberOfDays, "day").hour(0).minute(0).second(0).millisecond(0).add(diffInUTC, "minute");
        const toDate = dayjs().subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(diffInUTC, "minute");

        let poolAssetsWorthFirst = new Prisma.Decimal(0);
        let poolAssetsWorthLatest = new Prisma.Decimal(0);

        for (let i = 0; i < assets.length; i++) {
            const asset = await findAssetDetailsByCGID(assets[i].assetId);
            if (!asset) {
                throw new Error("Asset not found")
            }
            const priceEntryForBeginDate = await findAssetPriceOnDate(asset.id, beginDate.toDate());
            if (!priceEntryForBeginDate) {
                throw new Error(`Couldn't get the prices for ${asset.id} - ${beginDate.toString()}`);
            }
            const priceEntryForToDate = await findAssetPriceOnDate(asset.id, toDate.toDate());
            if (!priceEntryForToDate) {
                throw new Error(`Couldn't get the prices for ${asset.id} - ${toDate.toString()}`);
            }

            const amountInUSDForAssetSplit = amountInUSD * (assets[i].assetAllocationPercent / 100);
            const assetBalance = Prisma.Decimal.div(amountInUSDForAssetSplit, priceEntryForBeginDate.price);
            const assetWorthByEnd = assetBalance.mul(priceEntryForToDate.price);

            poolAssetsWorthFirst = poolAssetsWorthFirst.add(amountInUSDForAssetSplit);
            poolAssetsWorthLatest = poolAssetsWorthLatest.add(assetWorthByEnd);
        }

        const n = (numberOfDays / 365);
        const cagr = ((((poolAssetsWorthLatest.div(poolAssetsWorthFirst)).toNumber()) ** (1 / n) - 1) * 100);
        console.log(`For Mock Pool ${n} years CAGR is ${cagr}`);
        return {
            cagrValue: cagr,
            numberOfYears: n
        };

    } catch (error) {
        console.error(error)
    }
}

export default mockPoolPerformance;