import prisma from "../utils/prismaClient";

const getAssetAveragePrice = async (assetId: number, from: Date, to: Date) => {
    const assetAveragePriceDetails = await prisma.assetPriceSpecifics.aggregate({
        where: {
            assetId,
            AND: [
                {
                    priceTimestamp: { gte: from },

                },
                {
                    priceTimestamp: { lte: to },
                }
            ]
        },
        _avg: {
            price: true
        },
        _count: {
            price: true
        }
    })
    console.log(`Price aggregate for ${assetId} between ${from} - ${to} is ${assetAveragePriceDetails._avg.price} taking ${assetAveragePriceDetails._count.price} values into consideration`)
    return assetAveragePriceDetails._avg.price;
};

export default getAssetAveragePrice;
