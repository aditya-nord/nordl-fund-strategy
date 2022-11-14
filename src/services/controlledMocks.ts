import fs from "fs";
import dayjs from "dayjs";
import mockPoolPerformance, { PoolAssets } from "./mockPoolPerformance";
import mockPoolStartDate from "./mockPoolStartDate";
import mockPoolSIPPerformanceWithCAGR from "./mockPoolSIPPerformanceWithCAGR";

export interface PoolSpecificPerformance {
    startPoolWorth: string,
    startPoolDate: Date,
    endPoolWorth: string,
    endPoolDate: Date,
    absoluteReturns: string,
    cagrValue: number,
    numberOfYears: number
}

export const controlledMockPoolPerformance = async (assets: PoolAssets[], amountInUSD: number, poolName: string) => {
    try {
        const possibleDateDetails = await mockPoolStartDate(assets);
        if (!possibleDateDetails) {
            throw new Error("Could not calculate start date for the pool");
        }

        const startDate = dayjs(possibleDateDetails.startDate).add(30, "day");
        const yesterdayDate = dayjs().subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");

        const numberOfDays = dayjs(yesterdayDate).diff(startDate, 'day');
        const numberOfYears = Math.ceil(numberOfDays / 365);

        const poolPerformances: PoolSpecificPerformance[] = [];
        for (let i = 1; i <= numberOfYears; i++) {
            if (i * 365 > numberOfDays) {
                // Cannot go beyond startDate
                const res = await mockPoolPerformance(assets, numberOfDays, amountInUSD);
                if (!res) {
                    throw new Error("Failed to calculate pool performance");
                }
                poolPerformances.push(res);
            } else {
                // Date will be yesterday - 'i' years
                const res = await mockPoolPerformance(assets, i * 365, amountInUSD);
                if (!res) {
                    throw new Error("Failed to calculate pool performance");
                }
                poolPerformances.push(res);
            }
        }

        const resultData = {
            poolName,
            poolPerformances
        }

        const jsonData = JSON.stringify({ resultData });
        fs.writeFile(poolName + "_AbsolutePerformance.json", jsonData, (err: any) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved with filename" + poolName + "_AbsolutePerformance.json");
        });
    } catch (error) {
        console.error(error);
    }
}

export const controlledMockPoolSIPPerformance = async (assets: PoolAssets[], amountInUSD: number, poolName: string) => {
    try {
        const possibleDateDetails = await mockPoolStartDate(assets);
        if (!possibleDateDetails) {
            throw new Error("Could not calculate start date for the pool");
        }

        const startDate = dayjs(possibleDateDetails.startDate).add(30, "day");
        const yesterdayDate = dayjs().subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");

        const numberOfDays = dayjs(yesterdayDate).diff(startDate, 'day');


        const numberOfWeeklyInvestments = Math.floor(numberOfDays / 7);
        const numberOfMonthlyInvestments = Math.floor(numberOfDays / 30);

        const poolWeeklySIP = await mockPoolSIPPerformanceWithCAGR(assets, 7, numberOfWeeklyInvestments, amountInUSD, poolName);
        const poolMonthlySIP = await mockPoolSIPPerformanceWithCAGR(assets, 30, numberOfMonthlyInvestments, amountInUSD, poolName);

        if (!poolWeeklySIP || !poolMonthlySIP) {
            throw new Error("Could not calculate SIP details");
        }

        const resultData = {
            poolName,
            poolWeeklySIP,
            poolMonthlySIP
        }

        const jsonData = JSON.stringify({ resultData });
        fs.writeFile(poolName + "_SIPPerformances.json", jsonData, (err: any) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved with filename" + poolName + "_SIPPerformances.json");
        });
    } catch (error) {
        console.error(error);
    }
}
