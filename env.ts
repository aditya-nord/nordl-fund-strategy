import dotenv from "dotenv";
dotenv.config();
export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || 3000;

export const env = process?.env?.ENVIRONMENT;

export const MASTER_DECIMAL_PLACES = parseInt(process?.env?.MASTER_DECIMAL_PLACES || "18");
