import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import Giveaway from "../models/Giveaway.js";
import GiveawayParticipation from "../models/GiveawayParticipation.js";
import GiveawayWinner from "../models/GiveawayWinner.js";
import Prize from "../models/Prize.js";
import { createParticipation } from "../services/participationService.js";

const FIXTURE_GIVEAWAY_ID = "GW-2026-WINNER-E2E";
const FIXTURE_PRIZE_ID = "PRIZE-WINNER-E2E";
const FIXTURE_USER_ID = "DEV-USER-1002";
const FIXTURE_END_AT = new Date("2026-09-20T23:59:59.000Z");
const FIXTURE_START_AT = new Date("2026-09-01T00:00:00.000Z");

async function seedWinnerFixture() {
	if (env.nodeEnv === "production") {
		throw new Error("The winner E2E fixture cannot be seeded in production.");
	}

	await connectDB();

	let giveaway = await Giveaway.findOne({ id: FIXTURE_GIVEAWAY_ID });
	if (giveaway) {
		const [winnerCount, existingPrize] = await Promise.all([
			GiveawayWinner.countDocuments({ giveawayId: giveaway._id }),
			Prize.findOne({ id: FIXTURE_PRIZE_ID }).select("giveawayId"),
		]);
		if (giveaway.winnersFinalizedAt || winnerCount > 0) {
			throw new Error("Winner fixture has already been finalized and will not be reset.");
		}
		if (existingPrize && existingPrize.giveawayId.toString() !== giveaway._id.toString()) {
			throw new Error("Winner fixture prize belongs to another giveaway.");
		}
	} else {
		giveaway = new Giveaway({
			id: FIXTURE_GIVEAWAY_ID,
			title: "Winner Finalization E2E Fixture",
			slug: "winner-finalization-e2e-fixture",
			description: "Development-only fixture for winner finalization E2E testing.",
			status: "ACTIVE",
			startAt: FIXTURE_START_AT,
			endAt: new Date("2099-12-31T23:59:59.000Z"),
			winnersFinalizedAt: null,
			isTestFixture: true,
			rules: [],
			eligibility: {},
			participationSettings: {
				maxParticipationsPerUser: 1,
				entryCurrency: "SVES",
				entryAmount: 1,
			},
		});
		await giveaway.save();
	}

	const prize = await Prize.findOneAndUpdate(
		{ id: FIXTURE_PRIZE_ID },
		{
			$set: {
				id: FIXTURE_PRIZE_ID,
				giveawayId: giveaway._id,
				name: "Winner Finalization E2E Prize",
				position: 1,
				image: null,
				description: "Development-only prize for winner finalization E2E testing.",
				winnerCount: 1,
				prizeType: "DIGITAL",
				claimType: "DIGITAL",
				entryCurrency: "SVES",
				entryAmount: 1,
				status: "AVAILABLE",
			},
		},
		{ new: true, upsert: true, setDefaultsOnInsert: true },
	);

	await Giveaway.updateOne(
		{ _id: giveaway._id },
		{ $set: { prizes: [prize._id] } },
	);

	const existingParticipation = await GiveawayParticipation.findOne({
		userId: FIXTURE_USER_ID,
		giveawayId: giveaway._id,
	});
	if (!existingParticipation) {
		await createParticipation({
			userId: FIXTURE_USER_ID,
			giveawayId: FIXTURE_GIVEAWAY_ID,
			prizeId: FIXTURE_PRIZE_ID,
			deviceHash: "winner-finalization-e2e-fixture",
			idempotencyKey: "WINNER-FINALIZATION-E2E-DEV-USER-1002",
		});
	}

	giveaway = await Giveaway.findOneAndUpdate(
		{ _id: giveaway._id, winnersFinalizedAt: null },
		{
			$set: {
				status: "ENDED",
				startAt: FIXTURE_START_AT,
				endAt: FIXTURE_END_AT,
				winnersFinalizedAt: null,
				isTestFixture: true,
				prizes: [prize._id],
			},
		},
		{ new: true },
	).lean();

	if (!giveaway) throw new Error("Winner fixture could not be left unfinalized.");

	console.log(`Seeded winner finalization fixture ${giveaway.id} with prize ${prize.id}.`);
}

try {
	await seedWinnerFixture();
} catch (error) {
	console.error(`Winner fixture seed failed: ${error.message}`);
	process.exitCode = 1;
} finally {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
	}
}
