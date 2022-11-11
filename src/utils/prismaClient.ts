import { PrismaClient } from "@prisma/client";
import { NODE_ENV } from "../../env";

const prisma = new PrismaClient({
    log:
        NODE_ENV === "development" ? ["info", "error", "warn"] : undefined,
});

export default prisma;
