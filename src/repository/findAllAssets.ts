import prisma from "../utils/prismaClient";

const findAllAssets = async () => {
    const allAssets = await prisma.assetDetails.findMany();
    return allAssets;
};

export default findAllAssets;
