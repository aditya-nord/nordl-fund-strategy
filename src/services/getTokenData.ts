import fs from "fs";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import findAssetPriceOnDate from "../repository/findAssetPriceOnDate";
import findAssetDetailsByCGID from "../repository/findAssetDetailsByCGID";
import mockPoolStartDate from "./mockPoolStartDate";

export interface PoolAssets {
	assetAllocationPercent: number;
	assetId: string;
}

interface PoolAssetDetails {
	assetAllocationPercent: number;
	assetId: string;
	assetBalance: Prisma.Decimal;
	assetPrice: number;
	worthInUSD: Prisma.Decimal;
}

interface GraphData {
	timeStamp: Date;
	worthNowInUSD: string;
	costPerUnit: string;
	totalUnitsAllocated: string;
	poolBalances: PoolAssetDetails[];
}
interface PoolMonthlyReturns {
	startDate: Date;
	endDate: Date;
	startPrice: number;
	endPrice: number;
	absoluteReturns: number;
}

interface MinGraphData {
	timeStamp: Date;
	costPerUnit: string;
}

export const getPoolMonthlyReturns = async (assets: PoolAssets[], numberOfDays: number, initUnitCost: number, fileName: string) => {
	try {
		// const possibleDateDetails = await mockPoolStartDate(assets);
		// if (!possibleDateDetails) {
		//     throw new Error("Could not calculate start date for the pool");
		// }

		// const startDate = dayjs(possibleDateDetails.startDate).add(30, "day");
		const startDate = dayjs().subtract(numberOfDays, "day").startOf("month").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");

		// const yesterdayDate = dayjs().subtract(10, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");
		// const numberOfDays = dayjs(yesterdayDate).diff(startDate, "day");

		let totalAlloc = 0;
		for (let i = 0; i < assets.length; i++) {
			totalAlloc += assets[i].assetAllocationPercent;
		}
		if (totalAlloc !== 100) {
			throw new Error("Allocation Percentage does not add up to 100%");
		}

		let poolBalances: PoolAssetDetails[] = [];
		for (let i = 0; i < assets.length; i++) {
			poolBalances.push({
				assetAllocationPercent: assets[i].assetAllocationPercent,
				assetId: assets[i].assetId,
				assetPrice: 0,
				assetBalance: new Prisma.Decimal(0),
				worthInUSD: new Prisma.Decimal(0),
			});
		}

		const resultData: PoolMonthlyReturns[] = [];
		let totalInvestedAmountInUSD = new Prisma.Decimal(0);

		const baseUnitPrice = new Prisma.Decimal(initUnitCost);
		const amountInUSD = 10;
		let totalShareBalance = new Prisma.Decimal(0);

		const firstCalc = await calculationsOnBeginDate(assets, poolBalances, amountInUSD, startDate.toDate(), baseUnitPrice);
		totalShareBalance = firstCalc.totalShareBalance;
		poolBalances = firstCalc.poolBalances;
		// resultData.push({
		// 	startDate:
		// 	costPerUnit: firstCalc.newCostPerUnit.toFixed(),
		// 	// poolBalances: firstCalc.poolBalances,
		// 	timeStamp: startDate.toDate(),
		// 	// totalUnitsAllocated: totalShareBalance.toFixed(),
		// 	// worthNowInUSD: firstCalc.poolAssetsWorth.toFixed()
		// });

		const numberOfMonths = Math.floor(numberOfDays / 30);
		for (let i = numberOfDays, j = 1; i > 2; i -= 30, j++) {
			const diffInUTC = dayjs().utcOffset();
			const aroundDate = dayjs().subtract(i, "day").hour(0).minute(0).second(0).millisecond(0).add(diffInUTC, "minute");
			const startDateForMonth = aroundDate.startOf("month").hour(0).minute(0).second(0).millisecond(0).add(diffInUTC, "minute");
			const endDateForMonth = aroundDate.endOf("month").hour(0).minute(0).second(0).millisecond(0).add(diffInUTC, "minute");
			// const forDate = dayjs().subtract(i, "day").hour(0).minute(0).second(0).millisecond(0).add(diffInUTC, "minute");

			const calculatedDetailsStart = await calculationsAtADate(assets, poolBalances, startDateForMonth.toDate(), totalShareBalance);
			const calculatedDetailsEnd = await calculationsAtADate(assets, poolBalances, endDateForMonth.toDate(), totalShareBalance);

			const absoluteReturns = calculatedDetailsStart.newCostPerUnit
				.sub(calculatedDetailsEnd.newCostPerUnit)
				.div(calculatedDetailsStart.newCostPerUnit)
				.mul(100)
				.toNumber();

			poolBalances = calculatedDetailsEnd.poolBalances;
			totalInvestedAmountInUSD = totalInvestedAmountInUSD.add(amountInUSD);

			resultData.push({
				startDate: startDateForMonth.toDate(),
				endDate: endDateForMonth.toDate(),
				startPrice: calculatedDetailsStart.newCostPerUnit.toNumber(),
				endPrice: calculatedDetailsEnd.newCostPerUnit.toNumber(),
				absoluteReturns,
			});
		}

		const jsonData = JSON.stringify({ resultData });
		fs.writeFile("poolGraph-" + fileName + ".json", jsonData, (err: any) => {
			if (err) {
				throw err;
			}
			console.log("JSON data is saved with filename : poolGraph-" + fileName + ".json");
		});
		return {
			startPoolDate: startDate,
			endPoolDate: dayjs().subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute"),
			graphDataPoints: resultData,
		};
	} catch (error) {
		console.error(error);
		return null;
	}
};

const calculationsOnBeginDate = async (
	assets: PoolAssets[],
	poolBalances: PoolAssetDetails[],
	amountInUSD: number,
	forDate: Date,
	baseUnitPrice: Prisma.Decimal
) => {
	try {
		let poolAssetsWorth = new Prisma.Decimal(0);
		let updatedPoolBalances: PoolAssetDetails[] = [];

		for (let i = 0; i < assets.length; i++) {
			const asset = await findAssetDetailsByCGID(assets[i].assetId);
			if (!asset) {
				throw new Error("Asset not found");
			}

			const priceEntry = await findAssetPriceOnDate(asset.id, forDate);
			if (!priceEntry) {
				throw new Error(`Couldn't get the prices for ${asset.id} - ${forDate.toString()}`);
			}

			let z = poolBalances.findIndex((x) => x.assetId == assets[i].assetId) ?? null;
			if (z == null) {
				throw new Error("NOT FOUND poolAssetBalance");
			}

			const amountInUSDForAssetSplit = amountInUSD * (assets[i].assetAllocationPercent / 100);
			const assetBalanceUpdate = Prisma.Decimal.div(amountInUSDForAssetSplit, priceEntry.price);
			const newAssetBalance = poolBalances[z].assetBalance.add(assetBalanceUpdate);
			const newAssetWorth = newAssetBalance.mul(priceEntry.price);

			updatedPoolBalances.push({
				assetId: assets[i].assetId,
				assetAllocationPercent: assets[i].assetAllocationPercent,
				assetPrice: priceEntry.price,
				assetBalance: newAssetBalance,
				worthInUSD: newAssetWorth,
			});
			poolAssetsWorth = poolAssetsWorth.add(newAssetWorth);
		}

		let newCostPerUnit = baseUnitPrice;

		const shareBalanceUpdate = Prisma.Decimal.div(amountInUSD, newCostPerUnit);
		const totalShareBalance = shareBalanceUpdate;

		return {
			poolBalances: updatedPoolBalances,
			poolAssetsWorth,
			newCostPerUnit,
			totalShareBalance,
		};
	} catch (error: any) {
		throw new Error(error);
	}
};

const calculationsAtADate = async (assets: PoolAssets[], poolBalances: PoolAssetDetails[], forDate: Date, totalShareBalance: Prisma.Decimal) => {
	try {
		let updatedPoolAssetsWorth = new Prisma.Decimal(0);
		let updatedPoolBalances: PoolAssetDetails[] = [];

		for (let i = 0; i < assets.length; i++) {
			const asset = await findAssetDetailsByCGID(assets[i].assetId);
			if (!asset) {
				throw new Error("Asset not found");
			}

			const priceEntry = await findAssetPriceOnDate(asset.id, forDate);
			if (!priceEntry) {
				throw new Error(`Couldn't get the prices for ${asset.id} - ${forDate.toString()}`);
			}

			let z = poolBalances.findIndex((x) => x.assetId == assets[i].assetId) ?? null;
			if (z == null) {
				throw new Error("NOT FOUND poolAssetBalance");
			}

			const assetWorth = poolBalances[z].assetBalance.mul(priceEntry.price);
			updatedPoolAssetsWorth = updatedPoolAssetsWorth.add(assetWorth);

			updatedPoolBalances.push({
				assetId: assets[i].assetId,
				assetAllocationPercent: assets[i].assetAllocationPercent,
				assetPrice: priceEntry.price,
				assetBalance: poolBalances[z].assetBalance,
				worthInUSD: assetWorth,
			});
		}

		const newCostPerUnit = updatedPoolAssetsWorth.div(totalShareBalance);

		return {
			poolAssetsWorth: updatedPoolAssetsWorth,
			newCostPerUnit,
			poolBalances: updatedPoolBalances,
		};
	} catch (error) {
		throw error;
	}
};
