import fs from "fs";
import dayjs from "dayjs";
import findAssetDetailsByCGID from "../repository/findAssetDetailsByCGID";
import findAssetPriceOnDate from "../repository/findAssetPriceOnDate";
import getFirstAssetPriceEntry from "../repository/getFirstAssetPriceEntry";
import getAssetAveragePrice from "../repository/getAssetAveragePrice";
import { PoolAssets } from "./mockPoolPerformance";

interface TokenMonthlyReturnsObject {
	startDate: Date;
	endDate: Date;
	startPrice: number;
	endPrice: number;
	avgPrice: number;
	absoluteReturns: number;
}

export const tokenMonthlyReturns = async (cgTokenId: string) => {
	try {
		const asset = await findAssetDetailsByCGID(cgTokenId);
		if (!asset) {
			throw new Error("Asset not found");
		}
		const yesterdayDate = dayjs().subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");
		const assetFirstPriceEntry = await getFirstAssetPriceEntry(asset.id);
		const startDate = dayjs(assetFirstPriceEntry.priceTimestamp);
		const numberOfMonthsDataAvailable = dayjs(yesterdayDate).diff(startDate, "month");

		let takeMonths = numberOfMonthsDataAvailable;
		if (startDate.date() != 1) {
			takeMonths -= 1;
		}

		console.log(`takeMonths; ${takeMonths}`);
		const result: TokenMonthlyReturnsObject[] = [];
		for (let i = takeMonths; i >= 1; i--) {
			console.log(i);
			const fromDate = dayjs().subtract(i, "month").date(1).hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");
			const toDate = fromDate.endOf("month").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");

			const startPrice = await findAssetPriceOnDate(asset.id, fromDate.toDate());
			const avgPrice = await getAssetAveragePrice(asset.id, fromDate.toDate(), toDate.toDate());
			const endPrice = await findAssetPriceOnDate(asset.id, toDate.toDate());

			if (!startPrice || !endPrice) {
				throw new Error(`Could not get prices for dates ${fromDate} ${toDate}`);
			}

			const absoluteReturns = ((startPrice.price - endPrice.price) / startPrice.price) * 100;

			console.log(`absoluteReturns ${absoluteReturns}`);

			result.push({
				startDate: fromDate.toDate(),
				endDate: toDate.toDate(),
				startPrice: startPrice.price,
				endPrice: endPrice.price,
				avgPrice: avgPrice ?? 0,
				absoluteReturns,
			});
		}

		const resultData = {
			tokenName: asset.name,
			tokenSymbol: asset.symbol,
			numberOfMonths: takeMonths,
			monthlyPerformance: result,
		};

		return resultData;

		// const jsonData = JSON.stringify({ resultData });
		// fs.writeFile(asset.name + "_MonthlyPerformance.json", jsonData, (err: any) => {
		// 	if (err) {
		// 		throw err;
		// 	}
		// 	console.log("JSON data is saved with filename" + asset.name + "_MonthlyPerformance.json");
		// });
	} catch (error: any) {
		console.error(error);
	}
};

export const tokenWeeklyReturns = async (cgTokenId: string) => {
	try {
		const asset = await findAssetDetailsByCGID(cgTokenId);
		if (!asset) {
			throw new Error("Asset not found");
		}
		const yesterdayDate = dayjs().subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");
		const assetFirstPriceEntry = await getFirstAssetPriceEntry(asset.id);
		const startDate = dayjs(assetFirstPriceEntry.priceTimestamp);
		const numberOfWeeksDataAvailable = dayjs(yesterdayDate).diff(startDate, "week");

		let takeWeeks = numberOfWeeksDataAvailable - 1;

		console.log(`takeWeeks; ${takeWeeks}`);
		const result: TokenMonthlyReturnsObject[] = [];
		for (let i = takeWeeks; i >= 1; i--) {
			console.log(i);
			const fromDate = dayjs().startOf("week").subtract(i, "week").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");
			const toDate = fromDate.endOf("week").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");

			const startPrice = await findAssetPriceOnDate(asset.id, fromDate.toDate());
			const avgPrice = await getAssetAveragePrice(asset.id, fromDate.toDate(), toDate.toDate());
			const endPrice = await findAssetPriceOnDate(asset.id, toDate.toDate());

			if (!startPrice || !endPrice) {
				throw new Error(`Could not get prices for dates ${fromDate} ${toDate}`);
			}

			const absoluteReturns = ((startPrice.price - endPrice.price) / startPrice.price) * 100;

			console.log(`absoluteReturns ${absoluteReturns}`);

			result.push({
				startDate: fromDate.toDate(),
				endDate: toDate.toDate(),
				startPrice: startPrice.price,
				endPrice: endPrice.price,
				avgPrice: avgPrice ?? 0,
				absoluteReturns,
			});
		}

		const resultData = {
			tokenName: asset.name,
			tokenSymbol: asset.symbol,
			numberOfWeeks: takeWeeks,
			monthlyPerformance: result,
		};

		return resultData;

		// const jsonData = JSON.stringify({ resultData });
		// fs.writeFile(asset.name + "_WeeklyPerformance.json", jsonData, (err: any) => {
		// 	if (err) {
		// 		throw err;
		// 	}
		// 	console.log("JSON data is saved with filename" + asset.name + "_WeeklyPerformance.json");
		// });
	} catch (error: any) {
		console.error(error);
	}
};

export const tokenDailyReturns = async (cgTokenId: string) => {
	try {
		const asset = await findAssetDetailsByCGID(cgTokenId);
		if (!asset) {
			throw new Error("Asset not found");
		}
		const yesterdayDate = dayjs().subtract(1, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");
		const assetFirstPriceEntry = await getFirstAssetPriceEntry(asset.id);
		const startDate = dayjs(assetFirstPriceEntry.priceTimestamp);
		const numberOfWeeksDataAvailable = dayjs(yesterdayDate).diff(startDate, "day");

		let takeDays = numberOfWeeksDataAvailable - 1;

		console.log(`takeDays; ${takeDays}`);
		const result: TokenMonthlyReturnsObject[] = [];
		for (let i = takeDays; i >= 2; i--) {
			console.log(i);
			const fromDate = dayjs()
				.subtract(i + 1, "day")
				.hour(0)
				.minute(0)
				.second(0)
				.millisecond(0)
				.add(dayjs().utcOffset(), "minute");
			const toDate = dayjs().subtract(i, "day").hour(0).minute(0).second(0).millisecond(0).add(dayjs().utcOffset(), "minute");

			const startPrice = await findAssetPriceOnDate(asset.id, fromDate.toDate());
			const avgPrice = await getAssetAveragePrice(asset.id, fromDate.toDate(), toDate.toDate());
			const endPrice = await findAssetPriceOnDate(asset.id, toDate.toDate());

			if (!startPrice || !endPrice) {
				throw new Error(`Could not get prices for dates ${fromDate} ${toDate}`);
			}

			const absoluteReturns = ((startPrice.price - endPrice.price) / startPrice.price) * 100;

			console.log(`absoluteReturns ${absoluteReturns}`);

			result.push({
				startDate: fromDate.toDate(),
				endDate: toDate.toDate(),
				startPrice: startPrice.price,
				endPrice: endPrice.price,
				avgPrice: avgPrice ?? 0,
				absoluteReturns,
			});
		}

		const resultData = {
			tokenName: asset.name,
			tokenSymbol: asset.symbol,
			numberOfDays: takeDays,
			monthlyPerformance: result,
		};

		return resultData;

		// const jsonData = JSON.stringify({ resultData });
		// fs.writeFile(asset.name + "_DailyPerformance.json", jsonData, (err: any) => {
		// 	if (err) {
		// 		throw err;
		// 	}
		// 	console.log("JSON data is saved with filename" + asset.name + "_DailyPerformance.json");
		// });
	} catch (error: any) {
		console.error(error);
	}
};

export const getCompleteTokenPerformance = async (assets: PoolAssets[], cgTokenId?: string) => {
	try {
		if (assets.length <= 0 && cgTokenId) {
			const monthlyReturns = await tokenMonthlyReturns(cgTokenId);
			const weeklyReturns = await tokenWeeklyReturns(cgTokenId);
			const dailyReturns = await tokenDailyReturns(cgTokenId);

			const resultData = {
				tokenId: cgTokenId,
				monthlyReturns,
				weeklyReturns,
				dailyReturns,
			};

			const jsonData = JSON.stringify({ resultData });
			fs.writeFile(cgTokenId + "_CompletePerformance.json", jsonData, (err: any) => {
				if (err) {
					throw err;
				}
				console.log("JSON data is saved with filename" + cgTokenId + "_CompletePerformance.json");
			});
		} else if (assets.length > 0) {
			for (let i = 0; i < assets.length; i++) {
				const monthlyReturns = await tokenMonthlyReturns(assets[i].assetId);
				const weeklyReturns = await tokenWeeklyReturns(assets[i].assetId);
				const dailyReturns = await tokenDailyReturns(assets[i].assetId);

				const resultData = {
					tokenId: assets[i].assetId,
					monthlyReturns,
					weeklyReturns,
					dailyReturns,
				};

				const jsonData = JSON.stringify({ resultData });
				fs.writeFile(assets[i].assetId + "_CompletePerformance.json", jsonData, (err: any) => {
					if (err) {
						throw err;
					}
					console.log("JSON data is saved with filename" + assets[i].assetId + "_CompletePerformance.json");
				});
			}
		} else {
			throw new Error("No tokens passed to function call");
		}
	} catch (error) {
		console.error(error);
	}
};
