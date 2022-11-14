import axios from "axios"
import dayjs from "dayjs";
import createNewAssetPriceEntry from "../repository/createNewAssetPriceEntry";
import findAllAssets from "../repository/findAllAssets";
import getLastAssetPriceEntry from "../repository/getLastAssetPriceEntry";

const pendingPricesForAllTokens = async () => {
    try {

        const assetList = await findAllAssets();
        for (let i = 0; i < assetList.length; i++) {
            const asset = assetList[i];

            const lastAssetPriceDetails = await getLastAssetPriceEntry(asset.id);

            if (lastAssetPriceDetails.priceTimestamp == undefined) {
                throw new Error(`No lastAssetPriceDetails priceTimestamp found for ${asset.name}`)
            }

            const diffInUTC = dayjs().utcOffset();
            const todayDate = dayjs().hour(0).minute(0).second(0).millisecond(0).add(diffInUTC, "minute");
            const lastDate = dayjs(lastAssetPriceDetails.priceTimestamp);


            const diffTimeInSeconds = todayDate.unix() - lastDate.unix()
            const numberOfDays = Math.ceil(diffTimeInSeconds / (60 * 60 * 24));

            if (numberOfDays <= 1) {
                continue;
            }

            const priceFeeds: [[number, number]] = await getMarketCharts(asset.cgTokenId, numberOfDays);

            for (let i = 0; i < priceFeeds.length; i++) {
                const priceDetails = priceFeeds[i];

                console.log(priceDetails);

                const priceTimestamp = dayjs(priceDetails[0]).toDate();
                const price = priceDetails[1];

                const entry = await createNewAssetPriceEntry(asset.id, price, priceTimestamp);
                console.log(`entry made with id: ${entry.id} - ${entry.priceTimestamp} and price: ${entry.price}`)
            }
        }

    } catch (error) {
        console.error(error);
    }
}

const getMarketCharts = async (coin: string, days: number): Promise<[[number, number]]> => {

    const coinPriceHistoryAPI = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    try {
        const response = await axios.get(coinPriceHistoryAPI);
        console.log("Coingecko response: ", response.data.prices);
        return response.data.prices;
    } catch (err) {
        console.error(err);
        return [[0, 0]];
    }
}

export default pendingPricesForAllTokens;