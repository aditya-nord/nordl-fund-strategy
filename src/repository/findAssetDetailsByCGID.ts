import prisma from "../utils/prismaClient";

const findAssetDetailsByCGID = async (cgTokenId: string) => {
    const assetDetails = await prisma.assetDetails.findUnique({
        where: {
            cgTokenId: cgTokenId
        }
    });
    return assetDetails;
};

export default findAssetDetailsByCGID;
