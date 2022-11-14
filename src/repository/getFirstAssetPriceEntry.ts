import prisma from "../utils/prismaClient";

const getFirstAssetPriceEntry = async (assetId: number) => {
    const firstAssetPriceDetails = await prisma.assetPriceSpecifics.findMany({
        where: {
            assetId
        },
        orderBy: {
            priceTimestamp: "asc"
        },
        take: 1
    });
    return firstAssetPriceDetails[0];
};

export default getFirstAssetPriceEntry;
