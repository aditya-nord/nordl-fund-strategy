import express, { ErrorRequestHandler } from "express";
import http from "http";
import { NODE_ENV, PORT } from "../env";
import getAssetAveragePrice from "./repository/getAssetAveragePrice";
import { controlledMockPoolPerformance, controlledMockPoolSIPPerformance } from "./services/controlledMocks";
import createAssetDetails from "./services/createAssetDetails";
import loadPricesForToken from "./services/loadPricesForToken";
import mockAllTokenPerformances from "./services/mockAllTokenPerformances";
import mockPoolPerformance, { PoolAssets } from "./services/mockPoolPerformance";
import mockPoolSIPPerformance from "./services/mockPoolSIPPerformance";
import mockPoolSIPPerformanceWithCAGR from "./services/mockPoolSIPPerformanceWithCAGR";
import pendingPricesForAllTokens from "./services/pendingPricesForAllTokens";
import { BTC_ETH_Ratio_Fund, Fortune_Index_Fund_O2, Fortune_Index_Fund_O1, Fortune_Index_Fund_O3, DeFi_Focus_Index_Fund, Metaverse_Diverse_Index_Fund, Crypto_Bluechip_Index_Fund } from "./mockPoolsConfig";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    res
        .status(500)
        .send(
            NODE_ENV === "development" && err?.message
                ? err?.message
                : "Unexpected Error occured"
        );
};
app.use(onError);

server.listen(PORT, async () => {

    // createAssetDetails(
    //     "Yield Guild Games ", // Name
    //     "YGG", // Symbol
    //     "yield-guild-games" // CoinGecko API ID
    // )

    // loadPricesForToken("yield-guild-games", 2142);

    // pendingPricesForAllTokens();

    // mockAllTokenPerformances();

    // controlledMockPoolPerformance(BTC_ETH_Ratio_Fund, 1000, "Max_BTC_ETH_Ratio_Fund");

    // controlledMockPoolSIPPerformance(DeFi_Focus_Index_Fund, 100, "DeFi_Focus_Index_Fund");

    const allFunds: [PoolAssets[], string][] = [
        [BTC_ETH_Ratio_Fund, "BTC_ETH_Ratio_Fund"],
        [Fortune_Index_Fund_O2, "Fortune_Index_Fund_O2"],
        [Fortune_Index_Fund_O1, "Fortune_Index_Fund_O1"],
        [Fortune_Index_Fund_O3, "Fortune_Index_Fund_O3"],
        [DeFi_Focus_Index_Fund, "DeFi_Focus_Index_Fund"],
        [Metaverse_Diverse_Index_Fund, "Metaverse_Diverse_Index_Fund"],
        [Crypto_Bluechip_Index_Fund, "Crypto_Bluechip_Index_Fund"]
    ]

    // for (let i = 0; i < allFunds.length; i++) {
    //     const fundAssets = allFunds[i][0];
    //     const fundName = allFunds[i][1];

    //     controlledMockPoolPerformance(fundAssets, 1000, fundName);

    //     controlledMockPoolSIPPerformance(fundAssets, 100, fundName);
    // }


    // mockPoolPerformance(
    //     [
    //         {
    //             assetId: "bitcoin",
    //             assetAllocationPercent: 50
    //         },
    //         {
    //             assetId: "ethereum",
    //             assetAllocationPercent: 50
    //         }
    //     ],
    //     1000,
    //     100000
    // )

    // mockPoolSIPPerformanceWithCAGR(
    //     [
    //         {
    //             assetId: "bitcoin",
    //             assetAllocationPercent: 50
    //         },
    //         {
    //             assetId: "ethereum",
    //             assetAllocationPercent: 50
    //         }
    //     ],
    //     7, // Frequency in days
    //     160, // number of investments
    //     1000, // sip amount
    //     "blueChip" // file name
    // )

    console.log(`Server started on ${PORT}`)

});

export default server;