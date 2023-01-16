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
import {
	BTC_ETH_Ratio_Fund,
	Fortune_Index_Fund_O2,
	Fortune_Index_Fund_O1,
	Fortune_Index_Fund_O3,
	DeFi_Focus_Index_Fund,
	Metaverse_Diverse_Index_Fund,
	Crypto_Bluechip_Index_Fund,
	Alt_Metaverse_Diverse_Index_Fund,
	Fortune_Index_Fund_Prod,
	Crypto_Bluechip_Index_Fund_Prod,
	DeFi_Focus_Index_Fund_Prod,
	Metaverse_Diverse_Index_Fund_Prod,
} from "./mockPoolsConfig";
import generatePoolGraphData, { getPoolMonthlyReturns } from "./services/generatePoolGraphData";
import mockPoolStartDate from "./services/mockPoolStartDate";
import { getCompleteTokenPerformance } from "./services/tokenReturnsInTime";
import { initialize } from "./utils/initialize";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
	res.status(500).send(NODE_ENV === "development" && err?.message ? err?.message : "Unexpected Error occured");
};
app.use(onError);

server.listen(PORT, async () => {
	// initialize();

	// createAssetDetails(
	//     "Render ", // Name
	//     "RNDR", // Symbol
	//     "render-token" // CoinGecko API ID
	// )

	// loadPricesForToken("gmx", 2664);

	// pendingPricesForAllTokens();

	// mockAllTokenPerformances();

	// controlledMockPoolPerformance(BTC_ETH_Ratio_Fund, 1000, "BTC_ETH_Ratio_Fund");

	// controlledMockPoolSIPPerformance(DeFi_Focus_Index_Fund_Prod, 100, "DeFi_Focus_Index_Fund_Prod");

	const allFunds: [PoolAssets[], string][] = [
		[BTC_ETH_Ratio_Fund, "BTC_ETH_Ratio_Fund"],
		[Fortune_Index_Fund_O2, "Fortune_Index_Fund_O2"],
		[Fortune_Index_Fund_O1, "Fortune_Index_Fund_O1"],
		[Fortune_Index_Fund_O3, "Fortune_Index_Fund_O3"],
		[DeFi_Focus_Index_Fund, "DeFi_Focus_Index_Fund"],
		[Metaverse_Diverse_Index_Fund, "Metaverse_Diverse_Index_Fund"],
		[Crypto_Bluechip_Index_Fund, "Crypto_Bluechip_Index_Fund"],
		[Alt_Metaverse_Diverse_Index_Fund, "Alt_Metaverse_Diverse_Index_Fund"],
		[Fortune_Index_Fund_Prod, "Fortune_Index_Fund_Prod"],
	];

	// for (let i = 0; i < allFunds.length; i++) {
	//     const fundAssets = allFunds[i][0];
	//     const fundName = allFunds[i][1];

	//     controlledMockPoolPerformance(fundAssets, 1000, fundName);

	//     controlledMockPoolSIPPerformance(fundAssets, 100, fundName);
	// }

	// const possibleDateDetails = await mockPoolStartDate(BTC_ETH_Ratio_Fund);

	// generatePoolGraphData(BTC_ETH_Ratio_Fund, 2173, 0.22385, "BTC_ETH_Ratio_Fund_Pending");

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
	// 	Metaverse_Diverse_Index_Fund,
	// 	30, // Frequency in days
	// 	9, // number of investments
	// 	100, // sip amount
	// 	"Metaverse_Diverse_Index_Fund_FL_SIP" // file name
	// );

	// tokenMonthlyReturns("bitcoin", 71);

	// getCompleteTokenPerformance([], "cardano");

	// getPoolMonthlyReturns(Crypto_Bluechip_Index_Fund_Prod, 842, 2.45, "Crypto_Bluechip_Index_Monthly_Returns");

	console.log(`Server started on ${PORT}`);
});

export default server;
