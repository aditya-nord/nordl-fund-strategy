import fs from "fs";
import { Prisma } from "@prisma/client";
import dayjs, { ManipulateType } from "dayjs";
import findAssetPriceOnDate from "../repository/findAssetPriceOnDate";
import findAssetDetailsByCGID from "../repository/findAssetDetailsByCGID";
import getAssetAveragePrice from "../repository/getAssetAveragePrice";

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

interface GraphDataForSIP {
	timeStamp: Date;
	totalInvestedAmountInUSD: string;
	worthNowInUSD: string;
	investmentCount: number;
	costPerUnit: string;
	totalUnitsAllocated: string;
	poolBalances: PoolAssetDetails[];
}

const mockPoolSIPPerformanceWithCAGR = async (assets: PoolAssets[], frqInDays: number, investmentCount: number, amountInUSD: number, fileName: string) => {
	try {
		let totalAlloc = 0;
		for (let i = 0; i < assets.length; i++) {
			totalAlloc += assets[i].assetAllocationPercent;
		}
		if (totalAlloc !== 100) {
			throw new Error("Allocation Percentage does not add up to 100%");
		}

		const dayJsUnit = getDayJsUnits(frqInDays);

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

		const resultData: GraphDataForSIP[] = [];
		let totalInvestedAmountInUSD = new Prisma.Decimal(0);

		const baseUnitPrice = 10;
		let totalShareBalance = new Prisma.Decimal(0);

		for (let i = investmentCount, j = 1; i > 3; i--, j++) {
			const diffInUTC = dayjs().utcOffset();
			const forDate = dayjs().subtract(i, dayJsUnit).subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(diffInUTC, "minute");
			const toDate = forDate.add(frqInDays, "day").toDate();

			const calculatedDetails = await calculationsAtADate(
				assets,
				poolBalances,
				amountInUSD,
				forDate.toDate(),
				toDate,
				totalShareBalance,
				j == 1,
				new Prisma.Decimal(baseUnitPrice)
			);

			poolBalances = calculatedDetails.poolBalances;
			totalShareBalance = calculatedDetails.totalShareBalance;
			totalInvestedAmountInUSD = totalInvestedAmountInUSD.add(amountInUSD);

			resultData.push({
				investmentCount: j,
				timeStamp: forDate.toDate(),
				poolBalances,
				costPerUnit: calculatedDetails.newCostPerUnit.toFixed(),
				totalUnitsAllocated: totalShareBalance.toFixed(),
				totalInvestedAmountInUSD: totalInvestedAmountInUSD.toFixed(),
				worthNowInUSD: calculatedDetails.poolAssetsWorth.toFixed(),
			});
		}

		const worthNow = new Prisma.Decimal(resultData[resultData.length - 1].worthNowInUSD);
		const lastCostPerUnit = new Prisma.Decimal(resultData[resultData.length - 1].costPerUnit);

		const numberOfDays = frqInDays * investmentCount;
		console.log(`numberOfDays ${numberOfDays}`);
		const n = numberOfDays / 365;
		console.log(`n ${n}`);
		const cagrForSIP = (lastCostPerUnit.div(baseUnitPrice).toNumber() ** (1 / n) - 1) * 100;
		console.log(`For Mock Pool SIP of ${n} years CAGR is ${cagrForSIP}`);
		console.log(`Total worth today is ${worthNow.toFixed()}`);

		const absoluteReturns = worthNow.sub(totalInvestedAmountInUSD).div(totalInvestedAmountInUSD.div(100)).toFixed(4);
		console.log(`Mock Pool SIP returns are: ${absoluteReturns}`);

		const jsonData = JSON.stringify({ resultData });
		fs.writeFile("poolSIPMocked-" + fileName + ".json", jsonData, (err: any) => {
			if (err) {
				throw err;
			}
			console.log("JSON data is saved with filename : poolSIPMocked-" + fileName + ".json");
		});
		return {
			startPoolDate: dayjs()
				.subtract(investmentCount - 1, dayJsUnit)
				.subtract(1, "day")
				.hour(0)
				.minute(0)
				.second(0)
				.millisecond(0)
				.add(dayjs().utcOffset(), "minute"),
			endPoolDate: dayjs().subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute"),
			absoluteReturns,
			cagrValue: cagrForSIP,
			graphDataPoints: resultData,
		};
	} catch (error) {
		console.error(error);
		return null;
	}
};

const calculationsAtADate = async (
	assets: PoolAssets[],
	poolBalances: PoolAssetDetails[],
	amountInUSD: number,
	forDate: Date,
	toDate: Date,
	totalShareBalance: Prisma.Decimal,
	firstPurchase: boolean,
	baseUnitPrice: Prisma.Decimal
) => {
	try {
		let prevPoolAssetsWorth = new Prisma.Decimal(0);
		let poolAssetsWorth = new Prisma.Decimal(0);
		let updatedPoolBalances: PoolAssetDetails[] = [];

		for (let i = 0; i < assets.length; i++) {
			const asset = await findAssetDetailsByCGID(assets[i].assetId);
			if (!asset) {
				throw new Error("Asset not found");
			}

			const priceEntry = await getAssetAveragePrice(asset.id, forDate, toDate);
			if (priceEntry == null || priceEntry < 0) {
				throw new Error(`Couldn't get the prices for ${asset.id} - ${forDate.toString()}`);
			}

			let z = poolBalances.findIndex((x) => x.assetId == assets[i].assetId) ?? null;
			if (z == null) {
				throw new Error("NOT FOUND poolAssetBalance");
			}

			const prevAssetWorth = poolBalances[z].assetBalance.mul(priceEntry);
			prevPoolAssetsWorth = prevPoolAssetsWorth.add(prevAssetWorth);

			const amountInUSDForAssetSplit = amountInUSD * (assets[i].assetAllocationPercent / 100);
			const assetBalanceUpdate = Prisma.Decimal.div(amountInUSDForAssetSplit, priceEntry);
			const newAssetBalance = poolBalances[z].assetBalance.add(assetBalanceUpdate);
			const newAssetWorth = newAssetBalance.mul(priceEntry);

			updatedPoolBalances.push({
				assetId: assets[i].assetId,
				assetAllocationPercent: assets[i].assetAllocationPercent,
				assetPrice: priceEntry,
				assetBalance: newAssetBalance,
				worthInUSD: newAssetWorth,
			});
			poolAssetsWorth = poolAssetsWorth.add(newAssetWorth);
		}

		let newCostPerUnit = baseUnitPrice;

		if (!firstPurchase) {
			newCostPerUnit = prevPoolAssetsWorth.div(totalShareBalance);
		}

		const shareBalanceUpdate = Prisma.Decimal.div(amountInUSD, newCostPerUnit);
		totalShareBalance = totalShareBalance.add(shareBalanceUpdate);

		return {
			poolBalances: updatedPoolBalances,
			poolAssetsWorth,
			newCostPerUnit,
			totalShareBalance,
		};
	} catch (error) {
		throw error;
	}
};

const getDayJsUnits = (frqInDays: number): ManipulateType => {
	switch (frqInDays) {
		case 7:
			return "week";
		case 30:
			return "month";
		case 365:
			return "year";
		default:
			return "day";
	}
};

export default mockPoolSIPPerformanceWithCAGR;
