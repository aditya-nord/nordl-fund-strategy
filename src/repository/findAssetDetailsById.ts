import prisma from "../utils/prismaClient";

const findAssetDetailsById = async (assetId: number) => {
    const assetDetails = await prisma.assetDetails.findUnique({
        where: {
            id: assetId,
        }
    });
    return assetDetails;
};

export default findAssetDetailsById;
