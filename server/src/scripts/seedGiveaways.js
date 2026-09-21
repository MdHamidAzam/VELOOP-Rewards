import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Giveaway from "../models/Giveaway.js";
import GiveawayWinner from "../models/GiveawayWinner.js";
import Prize from "../models/Prize.js";
import { GIVEAWAY_SEED_DATA } from "../data/giveawaySeedData.js";

async function seedGiveaways() {
	await connectDB();

	for (const seedGiveaway of GIVEAWAY_SEED_DATA) {
		const { prizes, winners, ...giveawayData } = seedGiveaway;
		const giveaway = await Giveaway.findOneAndUpdate(
			{ id: giveawayData.id },
			{ $set: giveawayData },
			{ new: true, upsert: true, setDefaultsOnInsert: true },
		);
		const prizeIds = [];

		for (const prizeData of prizes) {
			const prize = await Prize.findOneAndUpdate(
				{ id: prizeData.id },
				{ $set: { ...prizeData, giveawayId: giveaway._id } },
				{ new: true, upsert: true, setDefaultsOnInsert: true },
			);
			prizeIds.push(prize._id);
		}

		await Giveaway.updateOne({ _id: giveaway._id }, { $set: { prizes: prizeIds } });
		if (winners.length === 0) {
			await GiveawayWinner.deleteMany({ giveawayId: giveaway._id });
		}

		for (const winnerData of winners) {
			const prize = await Prize.findOne({ id: winnerData.prizeId, giveawayId: giveaway._id }).select("_id");
			if (!prize) {
				throw new Error(`Seed prize not found: ${winnerData.prizeId}`);
			}

			await GiveawayWinner.findOneAndUpdate(
				{ userId: winnerData.userId, giveawayId: giveaway._id, prizeId: prize._id },
				{ $set: { ...winnerData, prizeId: prize._id } },
				{ new: true, upsert: true, setDefaultsOnInsert: true },
			);
		}
	}

	console.log(`Seeded ${GIVEAWAY_SEED_DATA.length} giveaways idempotently.`);
}

try {
	await seedGiveaways();
} catch (error) {
	console.error(`Giveaway seed failed: ${error.message}`);
	process.exitCode = 1;
} finally {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
	}
}
