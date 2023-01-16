import createAssetDetails from "../services/createAssetDetails";
import loadPricesForToken from "../services/loadPricesForToken";
import { assetList } from "./assetConfigList";

export const initialize = async () => {
	try {
		const MAX_DAYS = 2700;
		for (let i = 0; i < assetList.length; i++) {
			const asset = assetList[i];
			await createAssetDetails(
				asset.name, // Name
				asset.symbol, // Symbol
				asset.cgTokenId // CoinGecko API ID
			);

			setTimeout(() => {
				loadPricesForToken(asset.cgTokenId, MAX_DAYS);
			}, i * 6000);
		}
	} catch (error) {
		console.error(error);
	}
};
