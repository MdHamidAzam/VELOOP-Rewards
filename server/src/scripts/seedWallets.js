import mongoose from "mongoose";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import Wallet from "../models/Wallet.js";
import { DEVELOPMENT_WALLET_SEED_DATA } from "../data/walletSeedData.js";

async function seedWallets() {
	if (!["development", "test"].includes(env.nodeEnv)) {
		throw new Error("Wallet seed is restricted to development or test environments.");
	}

	await connectDB();

	for (const wallet of DEVELOPMENT_WALLET_SEED_DATA) {
		await Wallet.findOneAndUpdate(
			{ userId: wallet.userId, currency: wallet.currency },
			{ $setOnInsert: { ...wallet, status: "ACTIVE" } },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
	}

	console.log(`Seeded ${DEVELOPMENT_WALLET_SEED_DATA.length} development wallets idempotently.`);
}

try {
	await seedWallets();
} catch (error) {
	console.error(`Wallet seed failed: ${error.message}`);
	process.exitCode = 1;
} finally {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
	}
}
