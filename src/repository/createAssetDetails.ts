import prisma from "../utils/prismaClient";

const createNewAssetDetails = async (
    name: string,
    symbol: string,
    cgTokenId: string
) => {
    const asset = await prisma.assetDetails.create({
        data: {
            name,
            symbol,
            cgTokenId,
        },
    });
    return asset;
};

export default createNewAssetDetails;
