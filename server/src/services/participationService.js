import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import Giveaway from "../models/Giveaway.js";
import GiveawayEntryTransaction from "../models/GiveawayEntryTransaction.js";
import GiveawayParticipation from "../models/GiveawayParticipation.js";
import Prize from "../models/Prize.js";
import User from "../models/User.js";
import { deductWalletAtomically, WalletServiceError } from "./walletService.js";
import { FRAUD_EVENT_TYPES, recordFraudEvent } from "./fraudService.js";

export class ParticipationServiceError extends Error {
	constructor(message, { code, statusCode }) {
		super(message);
		this.name = "ParticipationServiceError";
		this.code = code;
		this.statusCode = statusCode;
	}
}

function requireValue(value, fieldName) {
	if (typeof value !== "string" || !value.trim()) {
		throw new ParticipationServiceError(`${fieldName} is required.`, {
			code: "VALIDATION_ERROR",
			statusCode: 400,
		});
	}

	return value.trim();
}

function mapWalletError(error) {
	if (!(error instanceof WalletServiceError)) return error;

	return new ParticipationServiceError(error.message, {
		code: error.code,
		statusCode: error.code === "WALLET_NOT_FOUND" ? 422 : error.statusCode,
	});
}

async function assertEligibility(giveaway, userId, session) {
	const eligibility = giveaway.eligibility ?? {};
	const countries = Array.isArray(eligibility.countries)
		? eligibility.countries.map((country) => String(country).trim().toUpperCase()).filter(Boolean)
		: [];
	const requiresAge = Number.isFinite(eligibility.minAge);
	const requiresCountry = countries.length > 0;
	const requiresVerification = eligibility.requiresVerifiedUser === true;

	if (!requiresAge && !requiresCountry && !requiresVerification) return;

	const user = await User.findOne({ userId, status: "ACTIVE" })
		.select("age country isVerified")
		.session(session)
		.lean();
	const normalizedCountry = user?.country?.trim().toUpperCase();

	const eligible = Boolean(
		user
		&& (!requiresAge || (Number.isFinite(user.age) && user.age >= eligibility.minAge))
		&& (!requiresCountry || countries.includes(normalizedCountry))
		&& (!requiresVerification || user.isVerified === true),
	);

	if (!eligible) {
		throw new ParticipationServiceError("You do not meet this giveaway's eligibility requirements.", {
			code: "USER_NOT_ELIGIBLE",
			statusCode: 422,
		});
	}
}

export async function createParticipation({ userId, giveawayId, prizeId, idempotencyKey, deviceHash }) {
	const authenticatedUserId = requireValue(userId, "Authenticated user");
	const publicGiveawayId = requireValue(giveawayId, "giveawayId");
	const publicPrizeId = requireValue(prizeId, "prizeId");
	const session = await mongoose.startSession();
	let result;

	try {
		await session.withTransaction(async () => {
			const giveaway = await Giveaway.findOne({ id: publicGiveawayId }).session(session).lean();
			if (!giveaway) {
				throw new ParticipationServiceError("Giveaway not found.", {
					code: "GIVEAWAY_NOT_FOUND",
					statusCode: 404,
				});
			}

			if (giveaway.status !== "ACTIVE") {
				throw new ParticipationServiceError("Giveaway is not active.", {
					code: "GIVEAWAY_NOT_ACTIVE",
					statusCode: 422,
				});
			}

			const now = new Date();
			if (now < new Date(giveaway.startAt)) {
				throw new ParticipationServiceError("Giveaway has not started yet.", {
					code: "GIVEAWAY_NOT_ACTIVE",
					statusCode: 422,
				});
			}
			if (now > new Date(giveaway.endAt)) {
				throw new ParticipationServiceError("Giveaway has ended.", {
					code: "GIVEAWAY_ENDED",
					statusCode: 422,
				});
			}

			await assertEligibility(giveaway, authenticatedUserId, session);

			if (typeof idempotencyKey === "string" && idempotencyKey.trim()) {
				const previousParticipation = await GiveawayParticipation.findOne({
					userId: authenticatedUserId,
					giveawayId: giveaway._id,
					idempotencyKey: idempotencyKey.trim(),
				}).select("_id prizeId transactionId").session(session).lean();
				if (previousParticipation) {
					result = {
						giveawayId: giveaway.id,
						prizeId: previousParticipation.prizeId.toString(),
						entryId: previousParticipation._id.toString(),
						transactionId: previousParticipation.transactionId,
						idempotent: true,
					};
					return;
				}
			}

			const prize = await Prize.findOne({ id: publicPrizeId }).session(session).lean();
			if (!prize) {
				throw new ParticipationServiceError("Prize not found.", {
					code: "PRIZE_NOT_FOUND",
					statusCode: 404,
				});
			}

			if (prize.giveawayId.toString() !== giveaway._id.toString()) {
				throw new ParticipationServiceError("Prize does not belong to this giveaway.", {
					code: "PRIZE_NOT_IN_GIVEAWAY",
					statusCode: 422,
				});
			}

			if (prize.status !== "AVAILABLE") {
				throw new ParticipationServiceError("Prize is not available.", {
					code: "PRIZE_UNAVAILABLE",
					statusCode: 422,
				});
			}

			if (!Number.isFinite(prize.entryAmount) || prize.entryAmount <= 0 || typeof prize.entryCurrency !== "string" || !prize.entryCurrency.trim()) {
				throw new ParticipationServiceError("Prize entry fee is not configured.", {
					code: "INVALID_ENTRY_FEE",
					statusCode: 422,
				});
			}

			const existingParticipation = await GiveawayParticipation.exists({
				userId: authenticatedUserId,
				giveawayId: giveaway._id,
			}).session(session);
			if (existingParticipation) {
				throw new ParticipationServiceError("User has already participated in this giveaway.", {
					code: "DUPLICATE_PARTICIPATION",
					statusCode: 409,
				});
			}

			if (deviceHash) {
				const matchingDevice = await GiveawayParticipation.exists({
					giveawayId: giveaway._id,
					deviceHash,
					userId: { $ne: authenticatedUserId },
				}).session(session);
				if (matchingDevice) {
					await recordFraudEvent({
						userId: authenticatedUserId,
						giveawayObjectId: giveaway._id,
						deviceHash,
						event: FRAUD_EVENT_TYPES.SUSPICIOUS_REQUEST,
						reason: "A device signal is associated with another giveaway participant.",
						riskLevel: "MEDIUM",
						riskScore: 45,
						session,
					});
				}
			}

			let wallet;
			try {
				wallet = await deductWalletAtomically({
					userId: authenticatedUserId,
					currency: prize.entryCurrency,
					amount: prize.entryAmount,
					session,
				});
			} catch (error) {
				throw mapWalletError(error);
			}

			const transactionId = randomUUID();
			const [transaction] = await GiveawayEntryTransaction.create([
				{
					userId: authenticatedUserId,
					giveawayId: giveaway._id,
					prizeId: prize._id,
					currency: wallet.currency,
					amount: prize.entryAmount,
					type: "ENTRY_DEDUCTION",
					status: "SUCCESS",
					balanceBefore: wallet.balanceBefore,
					balanceAfter: wallet.balanceAfter,
					transactionId,
				},
			], { session });

			const [participation] = await GiveawayParticipation.create([
				{
					userId: authenticatedUserId,
					giveawayId: giveaway._id,
					prizeId: prize._id,
					entryCurrency: wallet.currency,
					entryAmount: prize.entryAmount,
					status: "COMPLETED",
					joinedAt: new Date(),
					transactionId: transaction.transactionId,
					idempotencyKey: typeof idempotencyKey === "string" ? idempotencyKey.trim() : undefined,
					deviceHash,
				},
			], { session });

			result = {
				giveawayId: giveaway.id,
				prizeId: prize.id,
				entryId: participation._id.toString(),
				transactionId: transaction.transactionId,
				auditContext: {
					giveawayObjectId: giveaway._id,
					entityId: participation._id,
				},
			};
		});

		return result;
	} catch (error) {
		if (error?.code === 11000) {
			throw new ParticipationServiceError("User has already participated in this giveaway.", {
				code: "DUPLICATE_PARTICIPATION",
				statusCode: 409,
			});
		}

		throw error;
	} finally {
		await session.endSession();
	}
}
