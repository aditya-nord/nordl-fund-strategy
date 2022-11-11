import prisma from "../utils/prismaClient";

const createNewAssetPriceEntry = async (
    assetId: number,
    price: number,
    priceTimestamp: Date
) => {
    const assetPriceEntry = await prisma.assetPriceSpecifics.create({
        data: {
            asset: {
                connect: {
                    id: assetId
                }
            },
            price,
            priceTimestamp
        },
    });
    return assetPriceEntry;
};

export default createNewAssetPriceEntry;
