import dayjs from "dayjs";
import prisma from "../utils/prismaClient";

const createNewAssetPriceEntry = async (
    assetId: number,
    price: number,
    priceTimestamp: Date
) => {

    const standardDate = dayjs().hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");

    if (priceTimestamp.getHours() != standardDate.hour() || priceTimestamp.getMinutes() != standardDate.minute() || priceTimestamp.getFullYear() < 2008) {
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
