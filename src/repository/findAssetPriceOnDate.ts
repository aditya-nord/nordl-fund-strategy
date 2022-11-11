import prisma from "../utils/prismaClient";

const findAssetPriceOnDate = async (assetId: number, priceTimestamp: Date) => {
    const assetPriceDetails = await prisma.assetPriceSpecifics.findUnique({
        where: {
            assetId_priceTimestamp: {
                assetId,
                priceTimestamp
            }
        },
    });
    return assetPriceDetails;
};

export default findAssetPriceOnDate;
