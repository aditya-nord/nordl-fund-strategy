import fs from "fs";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import findAllAssets from "../repository/findAllAssets";
import findAssetDetailsByCGID from "../repository/findAssetDetailsByCGID"
import findAssetPriceOnDate from "../repository/findAssetPriceOnDate";
import getFirstAssetPriceEntry from "../repository/getFirstAssetPriceEntry";
import getAssetAveragePrice from "../repository/getAssetAveragePrice";

interface AnnualTokenPerformance {
    year: number,
    returns: number,
    priceFrom: number,
    priceTo: number,
    dateFrom: Date,
    dateTo: Date
}

interface TokenPerformance {
    asset: string,
    yearlyPerformance: AnnualTokenPerformance[]
}

const mockAllTokenPerformances = async () => {
    try {
        const allAssets = await findAllAssets();

        const resultData: TokenPerformance[] = [];

        for (let i = 0; i < allAssets.length; i++) {
            const asset = allAssets[i];

            const tokenResults = await mockTokenPerformance(asset.cgTokenId);
            resultData.push(tokenResults);
        }

        const jsonData = JSON.stringify({ resultData });
        fs.writeFile("allTokenPerformances.json", jsonData, (err: any) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved with filename allTokenPerformances.json");
        });
    } catch (error) {
        console.error(error)
    }
}

const mockTokenPerformance = async (assetId: string): Promise<TokenPerformance> => {
    try {
        const asset = await findAssetDetailsByCGID(assetId);
        if (!asset) {
            throw new Error("Asset not found")
        }

        const yesterdayDate = dayjs().subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");
        const yesterdayPriceDetails = await findAssetPriceOnDate(asset.id, yesterdayDate.toDate());
        if (!yesterdayPriceDetails) {
            throw new Error("Asset Price not found")
        }

        const yesterdayPrice = await getAssetAveragePrice(asset.id, yesterdayDate.subtract(30, "day").toDate(), yesterdayDate.toDate());
        if (!yesterdayPrice) {
            throw new Error("Could not find yesterdayPrice point")
        }
        // const yesterdayPrice = yesterdayPriceDetails.price;

        const assetFirstPriceEntry = await getFirstAssetPriceEntry(asset.id);
        const beginFromDate = dayjs(assetFirstPriceEntry.priceTimestamp).add(30, "day");
        const numberOfDays = dayjs(yesterdayDate).diff(beginFromDate, 'day');
        const numberOfYears = Math.ceil(numberOfDays / 365);

        const tokenAnnualPerformance: AnnualTokenPerformance[] = [];
        for (let i = 1; i <= numberOfYears; i++) {
            if (i * 365 > numberOfDays) {
                const pricePoint = await getAssetAveragePrice(asset.id, beginFromDate.toDate(), beginFromDate.add(30, "day").toDate())
                if (!pricePoint) {
                    throw new Error("Could not find price point")
                }

                const absoluteReturn = Prisma.Decimal.sub(yesterdayPrice, pricePoint).div(pricePoint / 100).toNumber();
                tokenAnnualPerformance.push({
                    year: i,
                    returns: absoluteReturn,
                    priceFrom: pricePoint,
                    priceTo: yesterdayPrice,
                    dateFrom: beginFromDate.toDate(),
                    dateTo: yesterdayDate.toDate()
                })
            } else {
                const relevantDate = yesterdayDate.subtract((i * 365), "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute").toDate()
                const pricePoint = await findAssetPriceOnDate(asset.id, relevantDate);
                if (!pricePoint) {
                    throw new Error(`Could not find price for: ${asset.cgTokenId} for date ${relevantDate.toDateString()} and has ${assetFirstPriceEntry.priceTimestamp}`)
                }

                const absoluteReturn = Prisma.Decimal.sub(yesterdayPrice, pricePoint.price).div(pricePoint.price / 100).toNumber();
                tokenAnnualPerformance.push({
                    year: i,
                    returns: absoluteReturn,
                    priceFrom: pricePoint.price,
                    priceTo: yesterdayPrice,
                    dateFrom: relevantDate,
                    dateTo: yesterdayDate.toDate()
                })
            }

        }

        return {
            asset: asset.cgTokenId,
            yearlyPerformance: tokenAnnualPerformance
        }

    } catch (error) {
        console.error(error)
        return {
            asset: assetId,
            yearlyPerformance: []
        }
    }
}

export default mockAllTokenPerformances;