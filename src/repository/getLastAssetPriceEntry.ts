import prisma from "../utils/prismaClient";

const getLastAssetPriceEntry = async (assetId: number) => {
    const lastAssetPriceDetails = await prisma.assetPriceSpecifics.findMany({
        where: {
            assetId
        },
        orderBy: {
            priceTimestamp: "desc"
        },
        take: 1
    });
    return lastAssetPriceDetails[0];
};

export default getLastAssetPriceEntry;
