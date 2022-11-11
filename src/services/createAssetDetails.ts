import { AssetDetails } from "@prisma/client";
import createNewAssetDetails from "../repository/createAssetDetails";

/**
 * @description - This function creates a new asset in the AssetDetails Table.
 *              - Default values for price it set to 0, if not provided.
 * @returns Promise<AssetDetails> or Promise<Error>
 */
const createAssetDetails = async (
    name: string,
    symbol: string,
    cgTokenId: string
): Promise<AssetDetails> => {
    try {
        const asset = await createNewAssetDetails(
            name,
            symbol,
            cgTokenId
        );
        return asset;

    } catch (error: any) {
        throw new Error(error);
    }
};
export default createAssetDetails;
