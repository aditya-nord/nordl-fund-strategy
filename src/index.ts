import express, { ErrorRequestHandler } from "express";
import http from "http";
import { NODE_ENV, PORT } from "../env";
import createAssetDetails from "./services/createAssetDetails";
import loadPricesForToken from "./services/loadPricesForToken";
import mockPoolPerformance from "./services/mockPoolPerformance";
import mockPoolSIPPerformance from "./services/mockPoolSIPPerformance";
import mockPoolSIPPerformanceWithCAGR from "./services/mockPoolSIPPerformanceWithCAGR";
import pendingPricesForAllTokens from "./services/pendingPricesForAllTokens";

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
    //     "Cardano", // Name
    //     "ADA", // Symbol
    //     "cardano" // CoinGecko API ID
    // )

    // loadPricesForToken("cardano", 730);

    // pendingPricesForAllTokens();


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