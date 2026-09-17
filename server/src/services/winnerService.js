import mongoose from "mongoose";
import { randomInt } from "node:crypto";
import Giveaway from "../models/Giveaway.js";
import GiveawayParticipation from "../models/GiveawayParticipation.js";
import GiveawayWinner from "../models/GiveawayWinner.js";
import Prize from "../models/Prize.js";
import { recordAuditLog } from "./auditService.js";

const FINALIZABLE_STATUS = "ENDED";
const SELECTION_METHOD = "CRYPTOGRAPHIC_RANDOM";

export class WinnerServiceError extends Error {
	constructor(message, { code, statusCode }) {
		super(message);
		this.name = "WinnerServiceError";
		this.code = code;
		this.statusCode = statusCode;
	}
}

function requireGiveawayId(giveawayId) {
	if (typeof giveawayId !== "string" || !giveawayId.trim()) {
		throw new WinnerServiceError("giveawayId is required.", {
			code: "VALIDATION_ERROR",
			statusCode: 400,
		});
	}

	return giveawayId.trim();
}

export function maskWinnerId(userId) {
	const normalizedUserId = String(userId).trim();
	if (normalizedUserId.includes("*")) return normalizedUserId;
	if (normalizedUserId.length <= 2) return `${normalizedUserId[0] ?? "U"}****`;

	return `${normalizedUserId.slice(0, 2)}****${normalizedUserId.slice(-2)}`;
}

export function selectRandomParticipants(participants, winnerCount, randomIndex = randomInt) {
	const shuffledParticipants = [...participants];

	for (let index = shuffledParticipants.length - 1; index > 0; index -= 1) {
		const swapIndex = randomIndex(index + 1);
		[shuffledParticipants[index], shuffledParticipants[swapIndex]] = [
			shuffledParticipants[swapIndex],
			shuffledParticipants[index],
		];
	}

	return shuffledParticipants.slice(0, Math.min(winnerCount, shuffledParticipants.length));
}

export function isGiveawayFinalizable(giveaway, now = new Date()) {
	return Boolean(
		giveaway
		&& giveaway.status === FINALIZABLE_STATUS
		&& !giveaway.winnersFinalizedAt
		&& new Date(now) > new Date(giveaway.endAt),
	);
}

export function buildWinnerDocuments({ participants, giveawayId, prizeId, selectedAt }) {
	return participants.map((participant) => ({
		userId: participant.userId,
		giveawayId,
		prizeId,
		status: "SELECTED",
		selectionMethod: SELECTION_METHOD,
		selectedAt,
		maskedId: maskWinnerId(participant.userId),
	}));
}

function alreadyFinalizedError() {
	return new WinnerServiceError("Giveaway winners have already been finalized.", {
		code: "WINNERS_ALREADY_FINALIZED",
		statusCode: 409,
	});
}

function serializeWinner(winner, prizeByObjectId) {
	const prize = prizeByObjectId.get(winner.prizeId.toString());
	return {
		id: winner._id.toString(),
		prizeId: prize?.id ?? winner.prizeId.toString(),
		prizeName: prize?.name ?? null,
		prizeImage: prize?.image ?? null,
		maskedId: winner.maskedId,
		status: winner.status,
		selectedAt: winner.selectedAt,
	};
}

function canExposeWinners(giveaway) {
	return ["ENDED", "ARCHIVED"].includes(giveaway.status)
		&& giveaway.winnersFinalizedAt != null;
}

export async function getGiveawayWinners(giveawayId) {
	const publicGiveawayId = requireGiveawayId(giveawayId);
	const giveaway = await Giveaway.findOne({ id: publicGiveawayId }).lean();
	if (!giveaway) return null;

	const prizes = await Prize.find({ giveawayId: giveaway._id }).lean();
	const prizeByObjectId = new Map(prizes.map((prize) => [prize._id.toString(), prize]));
	const winners = canExposeWinners(giveaway)
		? await GiveawayWinner.find({ giveawayId: giveaway._id }).sort({ selectedAt: -1 }).lean()
		: [];

	return {
		giveawayId: giveaway.id,
		status: giveaway.status,
		winnersFinalizedAt: giveaway.winnersFinalizedAt ?? null,
		winners: winners.map((winner) => serializeWinner(winner, prizeByObjectId)),
	};
}

export async function getPreviousWinners() {
	const giveaways = await Giveaway.find({
		status: { $in: ["ENDED", "ARCHIVED"] },
		winnersFinalizedAt: { $ne: null },
	}).sort({ endAt: -1 }).lean();

	return Promise.all(giveaways.map(async (giveaway) => {
		const winners = await getGiveawayWinners(giveaway.id);
		return {
			giveaway: {
				id: giveaway.id,
				title: giveaway.title,
				status: giveaway.status,
				endAt: giveaway.endAt,
				winnersFinalizedAt: giveaway.winnersFinalizedAt,
			},
			winners: winners?.winners ?? [],
		};
	}));
}

export async function finalizeGiveaway({ giveawayId, now = new Date(), actorId, requestId }) {
	const publicGiveawayId = requireGiveawayId(giveawayId);
	const finalizedAt = new Date(now);
	const session = await mongoose.startSession();
	let result;

	try {
		await session.withTransaction(async () => {
			const giveaway = await Giveaway.findOne({ id: publicGiveawayId }).session(session).lean();
			if (!giveaway) {
				throw new WinnerServiceError("Giveaway not found.", {
					code: "GIVEAWAY_NOT_FOUND",
					statusCode: 404,
				});
			}

			if (giveaway.winnersFinalizedAt) throw alreadyFinalizedError();

			if (giveaway.status !== FINALIZABLE_STATUS) {
				throw new WinnerServiceError("Giveaway is not eligible for winner finalization.", {
					code: "GIVEAWAY_NOT_ELIGIBLE",
					statusCode: 422,
				});
			}

			if (!(finalizedAt > new Date(giveaway.endAt))) {
				throw new WinnerServiceError("Giveaway has not ended yet.", {
					code: "GIVEAWAY_NOT_ENDED",
					statusCode: 422,
				});
			}

			const finalizedGiveaway = await Giveaway.findOneAndUpdate(
				{
					_id: giveaway._id,
					status: FINALIZABLE_STATUS,
					winnersFinalizedAt: null,
					endAt: { $lt: finalizedAt },
				},
				{ $set: { winnersFinalizedAt: finalizedAt } },
				{ new: true, session },
			).lean();

			if (!finalizedGiveaway) throw alreadyFinalizedError();

			const prizes = await Prize.find({ giveawayId: giveaway._id })
				.sort({ position: 1 })
				.session(session)
				.lean();
			const winnerSummary = [];

			for (const prize of prizes) {
				const participants = await GiveawayParticipation.find({
					giveawayId: giveaway._id,
					prizeId: prize._id,
					status: "COMPLETED",
				})
					.select("userId")
					.session(session)
					.lean();
				const selectedParticipants = selectRandomParticipants(participants, prize.winnerCount);
				const winnerDocuments = buildWinnerDocuments({
					participants: selectedParticipants,
					giveawayId: giveaway._id,
					prizeId: prize._id,
					selectedAt: finalizedAt,
				});

				const createdWinners = winnerDocuments.length > 0
					? await GiveawayWinner.create(winnerDocuments, { session })
					: [];

				winnerSummary.push({
					prizeId: prize.id,
					configuredWinnerCount: prize.winnerCount,
					selectedWinnerCount: createdWinners.length,
					winners: createdWinners.map((winner) => ({
						id: winner._id.toString(),
						maskedId: winner.maskedId,
					})),
				});
			}

			const auditCreated = await recordAuditLog({
				actorId,
				action: "WINNERS_FINALIZED",
				entityType: "GIVEAWAY",
				entityId: giveaway.id,
				giveawayId: giveaway._id,
				metadata: {
					result: "SUCCESS",
					status: finalizedGiveaway.status,
					method: SELECTION_METHOD,
				},
				requestId,
				session,
			});

			if (!auditCreated) {
				throw new WinnerServiceError("Winner finalization audit could not be recorded.", {
					code: "AUDIT_RECORD_FAILED",
					statusCode: 500,
				});
			}

			result = {
				giveaway: {
					id: finalizedGiveaway.id,
					status: finalizedGiveaway.status,
					winnersFinalizedAt: finalizedGiveaway.winnersFinalizedAt,
				},
				winnerSummary,
				totalWinners: winnerSummary.reduce((total, prize) => total + prize.selectedWinnerCount, 0),
			};
		});

		return result;
	} catch (error) {
		if (error?.code === 11000) throw alreadyFinalizedError();
		throw error;
	} finally {
		await session.endSession();
	}
	}
