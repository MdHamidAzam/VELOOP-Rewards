import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import Giveaway from "../models/Giveaway.js";
import { E2E_WINNER_FIXTURE_ID } from "../utils/giveawayVisibility.js";

const confirmation = process.env.CONFIRM_MARK_E2E_FIXTURE_PRIVATE;

async function markWinnerFixturePrivate() {
	if (env.nodeEnv === "production" && confirmation !== E2E_WINNER_FIXTURE_ID) {
		throw new Error(`Set CONFIRM_MARK_E2E_FIXTURE_PRIVATE=${E2E_WINNER_FIXTURE_ID} to classify only this fixture in production.`);
	}

	await connectDB();
	const result = await Giveaway.updateOne(
		{ id: E2E_WINNER_FIXTURE_ID },
		{ $set: { isTestFixture: true } },
	);
	console.log(`Fixture classification matched ${result.matchedCount} record(s); modified ${result.modifiedCount}. No history or transaction records were deleted.`);
}

try {
	await markWinnerFixturePrivate();
} catch (error) {
	console.error(`Fixture classification failed: ${error.message}`);
	process.exitCode = 1;
} finally {
	if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}