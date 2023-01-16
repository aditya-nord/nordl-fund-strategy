import axios from "axios"
import dayjs from "dayjs";
import createNewAssetPriceEntry from "../repository/createNewAssetPriceEntry";
import findAssetDetailsByCGID from "../repository/findAssetDetailsByCGID";
import findAssetPriceOnDate from "../repository/findAssetPriceOnDate";

const loadPricesForToken = async (assetId: string, numberOfDays: number) => {
    try {
        const asset = await findAssetDetailsByCGID(assetId);
        if (!asset) {
            throw new Error("Asset not found");
        }

        const priceFeeds: [[number, number]] = await getMarketCharts(asset.cgTokenId, numberOfDays);
        const priceTimestampS = dayjs(priceFeeds[0][0]).toDate();
        console.log(`Starting from ${priceTimestampS}`)


        for (let i = 0; i < priceFeeds.length; i++) {
            const priceDetails = priceFeeds[i];

            const priceTimestamp = dayjs(priceDetails[0]).toDate();
            const price = priceDetails[1];

            const check = await findAssetPriceOnDate(asset.id, priceTimestamp);
            if (check) {
                continue;
            }

            const entry = await createNewAssetPriceEntry(asset.id, price, priceTimestamp);
            if (entry) {
                console.log(`entry made with id: ${entry.id} - ${entry.priceTimestamp} and price: ${entry.price}`)
            }
        }

    } catch (error) {
        console.error(error);
    }
}

const getMarketCharts = async (coin: string, days: number): Promise<[[number, number]]> => {

    const coinPriceHistoryAPI = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`
    try {
        const response = await axios.get(coinPriceHistoryAPI);
        console.log("Coingecko response: ", response.data.prices);
        return response.data.prices;
    } catch (err) {
        console.error(err);
        return [[0, 0]];
    }
}

export default loadPricesForToken;