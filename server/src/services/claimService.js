import mongoose from "mongoose";
import Giveaway from "../models/Giveaway.js";
import GiveawayWinner from "../models/GiveawayWinner.js";
import GiveawayParticipation from "../models/GiveawayParticipation.js";
import Prize from "../models/Prize.js";
import PrizeClaim from "../models/PrizeClaim.js";
import { recordAuditLog } from "./auditService.js";

const CLAIM_WINDOW_DAYS = 7;
const PHYSICAL_CLAIM_FIELDS = ["name", "phone", "address", "city", "state", "PIN"];

export class ClaimServiceError extends Error {
	constructor(message, { code, statusCode }) {
		super(message);
		this.name = "ClaimServiceError";
		this.code = code;
		this.statusCode = statusCode;
	}
}

function requireValue(value, fieldName) {
	if (typeof value !== "string" || !value.trim()) {
		throw new ClaimServiceError(`${fieldName} is required.`, { code: "CLAIM_VALIDATION_ERROR", statusCode: 400 });
	}
	return value.trim();
}

function getClaimExpiry(selectedAt) {
	return new Date(new Date(selectedAt).getTime() + CLAIM_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

function validateClaimData(prize, payload) {
	if (prize.claimType === "PHYSICAL") {
		for (const field of PHYSICAL_CLAIM_FIELDS) requireValue(payload[field], field);
		return {
			name: payload.name.trim(),
			phone: payload.phone.trim(),
			address: payload.address.trim(),
			city: payload.city.trim(),
			state: payload.state.trim(),
			PIN: payload.PIN.trim(),
		};
	}

	if (["EMAIL", "GIFT_CARD", "DIGITAL"].includes(prize.claimType)) {
		const email = requireValue(payload.email, "email").toLowerCase();
		if (!/^\S+@\S+\.\S+$/.test(email)) {
			throw new ClaimServiceError("A valid email is required.", { code: "CLAIM_VALIDATION_ERROR", statusCode: 400 });
		}
		return { email };
	}

	throw new ClaimServiceError("This prize does not have a supported claim type.", { code: "CLAIM_NOT_ALLOWED", statusCode: 422 });
}

function serializeClaim(claim) {
	return {
		id: claim._id.toString(),
		giveawayId: claim.giveawayId.toString(),
		prizeId: claim.prizeId.toString(),
		claimType: claim.claimType,
		status: claim.status,
		submittedAt: claim.submittedAt ?? null,
		processedAt: claim.processedAt ?? null,
		completedAt: claim.completedAt ?? null,
		expiresAt: claim.expiresAt,
		claimData: claim.claimData ?? {},
	};
}

async function expireClaimIfNeeded(claim, session) {
	if (!claim || claim.status === "EXPIRED" || new Date() < new Date(claim.expiresAt)) return claim;
	const expiredClaim = await PrizeClaim.findOneAndUpdate(
		{ _id: claim._id, status: { $in: ["SUBMISSION", "SUBMITTED", "PROCESSING"] } },
		{ $set: { status: "EXPIRED" } },
		{ new: true, session },
	).lean();
	return expiredClaim ?? { ...claim, status: "EXPIRED" };
}

export async function submitPrizeClaim({ userId, giveawayId, payload }) {
	if (typeof userId !== "string" || !userId.trim()) throw new ClaimServiceError("Authentication is required.", { code: "AUTHENTICATION_REQUIRED", statusCode: 401 });
	if (typeof giveawayId !== "string" || !giveawayId.trim()) throw new ClaimServiceError("giveawayId is required.", { code: "CLAIM_VALIDATION_ERROR", statusCode: 400 });

	const session = await mongoose.startSession();
	let result;
	try {
		await session.withTransaction(async () => {
			const giveaway = await Giveaway.findOne({ id: giveawayId.trim() }).session(session).lean();
			if (!giveaway) throw new ClaimServiceError("Giveaway not found.", { code: "GIVEAWAY_NOT_FOUND", statusCode: 404 });

			const winner = await GiveawayWinner.findOne({ giveawayId: giveaway._id, userId: userId.trim() }).session(session).lean();
			if (!winner) throw new ClaimServiceError("Only a verified winner can claim this prize.", { code: "CLAIM_NOT_ALLOWED", statusCode: 403 });

			const existingClaim = await PrizeClaim.findOne({ winnerId: winner._id }).session(session).lean();
			if (existingClaim) {
				if (existingClaim.status === "EXPIRED" || new Date() >= new Date(existingClaim.expiresAt)) {
					if (existingClaim.status !== "EXPIRED") await PrizeClaim.updateOne({ _id: existingClaim._id }, { $set: { status: "EXPIRED" } }).session(session);
					throw new ClaimServiceError("The claim window has expired.", { code: "CLAIM_EXPIRED", statusCode: 422 });
				}
				throw new ClaimServiceError("A claim has already been submitted for this prize.", { code: "CLAIM_ALREADY_SUBMITTED", statusCode: 409 });
			}

			if (new Date() >= new Date(getClaimExpiry(winner.selectedAt))) {
				throw new ClaimServiceError("The claim window has expired.", { code: "CLAIM_EXPIRED", statusCode: 422 });
			}

			const prize = await Prize.findOne({ _id: winner.prizeId, giveawayId: giveaway._id }).session(session).lean();
			if (!prize) throw new ClaimServiceError("The winner prize could not be found.", { code: "PRIZE_NOT_FOUND", statusCode: 404 });

			const expiresAt = getClaimExpiry(winner.selectedAt);
			const claimData = validateClaimData(prize, payload);
			const [claim] = await PrizeClaim.create([{
				userId: userId.trim(),
				giveawayId: giveaway._id,
				prizeId: prize._id,
				winnerId: winner._id,
				claimType: prize.claimType,
				status: "SUBMITTED",
				submittedAt: new Date(),
				expiresAt,
				claimData,
			}], { session });
			await GiveawayWinner.updateOne({ _id: winner._id }, { $set: { status: "CLAIMED" } }).session(session);

			const auditCreated = await recordAuditLog({
				actorId: userId.trim(),
				action: "CLAIM_SUBMITTED",
				entityType: "CLAIM",
				entityId: claim._id,
				giveawayId: giveaway._id,
				metadata: { result: "SUCCESS", status: claim.status, claimType: claim.claimType },
				session,
			});
			if (!auditCreated) throw new ClaimServiceError("Claim audit could not be recorded.", { code: "AUDIT_RECORD_FAILED", statusCode: 500 });
			result = serializeClaim(claim);
		});
		return result;
	} catch (error) {
		if (error?.code === 11000) throw new ClaimServiceError("A claim has already been submitted for this prize.", { code: "CLAIM_ALREADY_SUBMITTED", statusCode: 409 });
		throw error;
	} finally {
		await session.endSession();
	}
}

export async function getMyPrizeClaim({ userId, giveawayId }) {
	const giveaway = await Giveaway.findOne({ id: giveawayId }).lean();
	if (!giveaway) return null;
	const claim = await PrizeClaim.findOne({ userId, giveawayId: giveaway._id }).lean();
	if (!claim) return { giveawayId: giveaway.id, claim: null };
	const expiredClaim = await expireClaimIfNeeded(claim);
	return { giveawayId: giveaway.id, claim: serializeClaim(expiredClaim) };
}

export async function getMyGiveawayStatus({ userId, giveawayId }) {
	const giveaway = await Giveaway.findOne({ id: giveawayId }).lean();
	if (!giveaway) return null;

	const [participation, winner] = await Promise.all([
		GiveawayParticipation.findOne({ userId, giveawayId: giveaway._id }).lean(),
		GiveawayWinner.findOne({ userId, giveawayId: giveaway._id }).lean(),
	]);
	let claim = winner ? await PrizeClaim.findOne({ winnerId: winner._id }).lean() : null;
	if (claim) claim = await expireClaimIfNeeded(claim);
	const prize = winner ? await Prize.findById(winner.prizeId).lean() : null;

	return {
		giveawayId: giveaway.id,
		participating: Boolean(participation),
		entries: participation ? 1 : 0,
		winner: winner && prize ? {
			id: winner._id.toString(),
			maskedId: winner.maskedId,
			prizeId: prize.id,
			prizeName: prize.name,
			claimType: prize.claimType,
			selectedAt: winner.selectedAt,
			claimDeadline: getClaimExpiry(winner.selectedAt),
		} : null,
		claim: claim ? serializeClaim(claim) : null,
	};
}

export async function updateClaimStatus({ giveawayId, claimId, status, actorId }) {
	const session = await mongoose.startSession();
	let result;
	try {
		await session.withTransaction(async () => {
			const giveaway = await Giveaway.findOne({ id: giveawayId }).session(session).lean();
			const claim = await PrizeClaim.findOne({ _id: claimId, giveawayId: giveaway?._id }).session(session).lean();
			if (!giveaway || !claim) throw new ClaimServiceError("Claim not found.", { code: "CLAIM_NOT_FOUND", statusCode: 404 });
			const allowedTransitions = {
				SUBMITTED: ["PROCESSING", "EXPIRED"],
				PROCESSING: ["COMPLETED", "EXPIRED"],
				COMPLETED: [],
				EXPIRED: [],
				SUBMISSION: ["PROCESSING", "EXPIRED"],
			};
			if (!allowedTransitions[claim.status]?.includes(status)) throw new ClaimServiceError("This claim status transition is not allowed.", { code: "CLAIM_STATUS_INVALID", statusCode: 422 });
			const update = { status };
			if (status === "PROCESSING") update.processedAt = new Date();
			if (status === "COMPLETED") update.completedAt = new Date();
			const updatedClaim = await PrizeClaim.findOneAndUpdate({ _id: claim._id }, { $set: update }, { new: true, session }).lean();
			const auditCreated = await recordAuditLog({ actorId, action: "CLAIM_STATUS_UPDATED", entityType: "CLAIM", entityId: claim._id, giveawayId: giveaway._id, metadata: { result: "SUCCESS", status }, session });
			if (!auditCreated) throw new ClaimServiceError("Claim audit could not be recorded.", { code: "AUDIT_RECORD_FAILED", statusCode: 500 });
			result = serializeClaim(updatedClaim);
		});
		return result;
	} finally {
		await session.endSession();
	}
}