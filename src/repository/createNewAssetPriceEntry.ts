import prisma from "../utils/prismaClient";

const createNewAssetPriceEntry = async (
    assetId: number,
    price: number,
    priceTimestamp: Date
) => {
    if (priceTimestamp.getHours() != 5 || priceTimestamp.getMinutes() != 30 || priceTimestamp.getFullYear() < 2008) {
        console.error(`Non Standard entry denied`)
        return null;
    }
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
