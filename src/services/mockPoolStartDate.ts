import dayjs from "dayjs";
import findAssetDetailsByCGID from "../repository/findAssetDetailsByCGID";
import getFirstAssetPriceEntry from "../repository/getFirstAssetPriceEntry";
import { PoolAssets } from "./mockPoolPerformance"

interface PoolAssetStartDates {
    asset: string,
    numberOfDays: number,
    startDate: Date
}

const mockPoolStartDate = async (assets: PoolAssets[]) => {
    try {
        const yesterdayDate = dayjs().subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");

        const resultData: PoolAssetStartDates[] = [];
        for (let i = 0; i < assets.length; i++) {
            const poolAsset = await findAssetDetailsByCGID(assets[i].assetId);
            if (!poolAsset) {
                throw new Error("Asset not found")
            }

            const assetFirstPriceEntry = await getFirstAssetPriceEntry(poolAsset.id);
            const startDate = dayjs(assetFirstPriceEntry.priceTimestamp);
            const numberOfDays = dayjs(yesterdayDate).diff(startDate, 'day');

            resultData.push({
                asset: poolAsset.cgTokenId,
                numberOfDays,
                startDate: startDate.toDate()
            })
        }

        resultData.sort((x, y) => x.numberOfDays - y.numberOfDays);
        console.log(`For the given pool assets, the earliest start date is identified as ${resultData[0].startDate} through ${resultData[0].asset}, numberOfDays as ${resultData[0].numberOfDays}`);

        return resultData[0];

    } catch (error) {
        console.error(error);
    }
}

export default mockPoolStartDate;