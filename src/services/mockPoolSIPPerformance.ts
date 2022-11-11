import fs from "fs";
import { Prisma } from "@prisma/client";
import dayjs, { ManipulateType } from "dayjs";
import findAssetPriceOnDate from "../repository/findAssetPriceOnDate";
import findAssetDetailsByCGID from "../repository/findAssetDetailsByCGID";

export interface PoolAssets {
    assetAllocationPercent: number,
    assetId: string
}

interface PoolAssetDetails {
    assetAllocationPercent: number,
    assetId: string,
    assetBalance: Prisma.Decimal,
    assetPrice: number,
    worthInUSD: Prisma.Decimal
}

interface GraphDataForSIP {
    timeStamp: Date;
    totalInvestedAmountInUSD: string;
    worthNowInUSD: string;
    investmentCount: number;
    poolBalances: PoolAssetDetails[]
}

const mockPoolSIPPerformance = async (assets: PoolAssets[], frqInDays: number, investmentCount: number, amountInUSD: number, fileName: string) => {
    try {

        let totalAlloc = 0;
        for (let i = 0; i < assets.length; i++) {
            totalAlloc += assets[i].assetAllocationPercent
        }
        if (totalAlloc !== 100) {
            throw new Error("Allocation Percentage does not add up to 100%");
        }

        const dayJsUnit = getDayJsUnits(frqInDays);

        let poolBalances: PoolAssetDetails[] = []
        for (let i = 0; i < assets.length; i++) {
            poolBalances.push({
                assetAllocationPercent: assets[i].assetAllocationPercent,
                assetId: assets[i].assetId,
                assetPrice: 0,
                assetBalance: new Prisma.Decimal(0),
                worthInUSD: new Prisma.Decimal(0)
            })

        }

        const resultData: GraphDataForSIP[] = [];
        let totalInvestedAmountInUSD = new Prisma.Decimal(0);


        for (let i = investmentCount - 1, j = 1; i >= 0; i--, j++) {
            const diffInUTC = dayjs().utcOffset();
            const forDate = dayjs().subtract(i, dayJsUnit).hour(0).minute(0).second(0).millisecond(0).add(diffInUTC, "minute");

            const calculatedDetails = await calculationsAtADate(assets, poolBalances, amountInUSD, forDate.toDate())
            poolBalances = calculatedDetails.poolBalances;
            totalInvestedAmountInUSD = totalInvestedAmountInUSD.add(amountInUSD);
            resultData.push({
                investmentCount: j,
                timeStamp: forDate.toDate(),
                poolBalances,
                totalInvestedAmountInUSD: totalInvestedAmountInUSD.toFixed(),
                worthNowInUSD: calculatedDetails.poolAssetsWorth.toFixed()
            })
        }

        const worthNow = new Prisma.Decimal(resultData[resultData.length - 1].worthNowInUSD)

        const returns = worthNow.sub(totalInvestedAmountInUSD).div(totalInvestedAmountInUSD.div(100))

        resultData.forEach(r => {
            console.log(r)
        })
        const jsonData = JSON.stringify({ resultData });
        fs.writeFile("poolSIPMocked-" + fileName + ".json", jsonData, (err: any) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved.");
        });

        console.log(`Mock Pool SIP returns are: ${returns}`)

        return returns;
    } catch (error) {
        console.error(error)
    }
}

const calculationsAtADate = async (assets: PoolAssets[], poolBalances: PoolAssetDetails[], amountInUSD: number, forDate: Date) => {
    try {
        let poolAssetsWorth = new Prisma.Decimal(0);
        let updatedPoolBalances: PoolAssetDetails[] = []

        for (let i = 0; i < assets.length; i++) {
            const asset = await findAssetDetailsByCGID(assets[i].assetId);
            if (!asset) {
                throw new Error("Asset not found")
            }
            const priceEntry = await findAssetPriceOnDate(asset.id, forDate);
            if (!priceEntry) {
                throw new Error(`Couldn't get the prices for ${asset.id} - ${forDate.toString()}`);
            }
            const amountInUSDForAssetSplit = amountInUSD * (assets[i].assetAllocationPercent / 100);
            const assetBalanceUpdate = Prisma.Decimal.div(amountInUSDForAssetSplit, priceEntry.price);

            let z = poolBalances.findIndex(x => x.assetId == assets[i].assetId) ?? null
            if (z == null) {
                throw new Error("NOT FOUND poolAssetBalance")
            }

            const newAssetBalance = poolBalances[z].assetBalance.add(assetBalanceUpdate)
            const newAssetWorth = newAssetBalance.mul(priceEntry.price)

            updatedPoolBalances.push({
                assetId: assets[i].assetId,
                assetAllocationPercent: assets[i].assetAllocationPercent,
                assetPrice: priceEntry.price,
                assetBalance: newAssetBalance,
                worthInUSD: newAssetWorth
            })
            poolAssetsWorth = poolAssetsWorth.add(newAssetWorth);
        }

        return {
            poolBalances: updatedPoolBalances,
            poolAssetsWorth
        }
    } catch (error) {
        throw error
    }
}

const getDayJsUnits = (frqInDays: number): ManipulateType => {
    switch (frqInDays) {
        case 7:
            return "week";
        case 30:
            return "month";
        case 365:
            return "year";
        default:
            return "day";
    }
};

export default mockPoolSIPPerformance;