import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import Giveaway from "../models/Giveaway.js";
import Prize from "../models/Prize.js";
import { recordAuditLog } from "../services/auditService.js";
import { HTTP_STATUS } from "../utils/constants.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

function handleAdminGiveawayError(res, error) {
	if (error?.name === "ValidationError" || error?.code === "VALIDATION_ERROR") {
		return sendError(res, { statusCode: HTTP_STATUS.BAD_REQUEST, code: "VALIDATION_ERROR", message: "The giveaway configuration is invalid." });
	}
	if (error?.code === 11000) {
		return sendError(res, { statusCode: HTTP_STATUS.CONFLICT, code: "RESOURCE_CONFLICT", message: "A giveaway or prize with these identifiers already exists." });
	}
	if (error?.code === "AUDIT_RECORD_FAILED") {
		return sendError(res, { statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, code: error.code, message: "The administrative change could not be audited." });
	}
	console.error("Administrative giveaway operation failed.");
	return sendError(res, { statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, code: "GIVEAWAY_ADMIN_OPERATION_ERROR", message: "The giveaway change could not be completed." });
}

async function requireAudit(options) {
	if (!await recordAuditLog(options)) {
		const error = new Error("Audit record required.");
		error.code = "AUDIT_RECORD_FAILED";
		throw error;
	}
}

export async function createGiveaway(req, res) {
	const session = await mongoose.startSession();
	let result;
	try {
		await session.withTransaction(async () => {
			const giveaway = new Giveaway({
				...req.body,
				rules: req.body.rules ?? [],
				eligibility: req.body.eligibility ?? {},
				participationSettings: { maxParticipationsPerUser: 1, ...(req.body.participationSettings ?? {}) },
				prizes: [],
				winnersFinalizedAt: null,
				isTestFixture: false,
			});
			await giveaway.save({ session });
			await requireAudit({ actorId: req.user.userId, action: "GIVEAWAY_CREATED", entityType: "GIVEAWAY", entityId: giveaway.id, giveawayId: giveaway._id, metadata: { result: "SUCCESS", status: giveaway.status }, requestId: req.get("x-request-id"), session });
			result = { id: giveaway.id, status: giveaway.status };
		});
		return sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: "Giveaway created.", data: result });
	} catch (error) {
		return handleAdminGiveawayError(res, error);
	} finally {
		await session.endSession();
	}
}

export async function updateGiveaway(req, res) {
	const session = await mongoose.startSession();
	let result;
	try {
		await session.withTransaction(async () => {
			const current = await Giveaway.findOne({ id: req.params.giveawayId }).session(session).lean();
			if (!current) {
				const error = new Error("Giveaway not found.");
				error.statusCode = HTTP_STATUS.NOT_FOUND;
				error.code = "GIVEAWAY_NOT_FOUND";
				throw error;
			}
			const startAt = new Date(req.body.startAt ?? current.startAt);
			const endAt = new Date(req.body.endAt ?? current.endAt);
			if (startAt >= endAt) {
				const error = new Error("startAt must be before endAt.");
				error.statusCode = HTTP_STATUS.BAD_REQUEST;
				error.code = "VALIDATION_ERROR";
				throw error;
			}
			const giveaway = await Giveaway.findOneAndUpdate(
				{ id: req.params.giveawayId },
				{ $set: req.body },
				{ new: true, runValidators: true, session },
			).lean();
			if (!giveaway) {
				const error = new Error("Giveaway not found.");
				error.statusCode = HTTP_STATUS.NOT_FOUND;
				error.code = "GIVEAWAY_NOT_FOUND";
				throw error;
			}
			await requireAudit({ actorId: req.user.userId, action: "GIVEAWAY_UPDATED", entityType: "GIVEAWAY", entityId: giveaway.id, giveawayId: giveaway._id, metadata: { result: "SUCCESS", status: giveaway.status }, requestId: req.get("x-request-id"), session });
			result = { id: giveaway.id, status: giveaway.status };
		});
		return sendSuccess(res, { message: "Giveaway updated.", data: result });
	} catch (error) {
		if (error.code === "GIVEAWAY_NOT_FOUND") return sendError(res, { statusCode: error.statusCode, code: error.code, message: error.message });
		if (error.code === "VALIDATION_ERROR") return sendError(res, { statusCode: error.statusCode, code: error.code, message: error.message });
		return handleAdminGiveawayError(res, error);
	} finally {
		await session.endSession();
	}
}

export async function createGiveawayPrize(req, res) {
	const session = await mongoose.startSession();
	let result;
	try {
		await session.withTransaction(async () => {
			const giveaway = await Giveaway.findOne({ id: req.params.giveawayId }).session(session).lean();
			if (!giveaway) {
				const error = new Error("Giveaway not found.");
				error.statusCode = HTTP_STATUS.NOT_FOUND;
				error.code = "GIVEAWAY_NOT_FOUND";
				throw error;
			}
			const [prize] = await Prize.create([{
				...req.body,
				id: req.body.id?.trim() || `PRIZE-${randomUUID()}`,
				giveawayId: giveaway._id,
			}], { session });
			await Giveaway.updateOne({ _id: giveaway._id }, { $addToSet: { prizes: prize._id } }, { session });
			await requireAudit({ actorId: req.user.userId, action: "PRIZE_CREATED", entityType: "PRIZE", entityId: prize.id, giveawayId: giveaway._id, metadata: { result: "SUCCESS", status: prize.status }, requestId: req.get("x-request-id"), session });
			result = { giveawayId: giveaway.id, prizeId: prize.id };
		});
		return sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: "Prize created.", data: result });
	} catch (error) {
		if (error.code === "GIVEAWAY_NOT_FOUND") return sendError(res, { statusCode: error.statusCode, code: error.code, message: error.message });
		return handleAdminGiveawayError(res, error);
	} finally {
		await session.endSession();
	}
}

export async function updateGiveawayPrize(req, res) {
	const session = await mongoose.startSession();
	let result;
	try {
		await session.withTransaction(async () => {
			const giveaway = await Giveaway.findOne({ id: req.params.giveawayId }).session(session).lean();
			if (!giveaway) {
				const error = new Error("Giveaway not found.");
				error.statusCode = HTTP_STATUS.NOT_FOUND;
				error.code = "GIVEAWAY_NOT_FOUND";
				throw error;
			}
			const prize = await Prize.findOneAndUpdate(
				{ id: req.params.prizeId, giveawayId: giveaway._id },
				{ $set: req.body },
				{ new: true, runValidators: true, session },
			).lean();
			if (!prize) {
				const error = new Error("Prize not found.");
				error.statusCode = HTTP_STATUS.NOT_FOUND;
				error.code = "PRIZE_NOT_FOUND";
				throw error;
			}
			await requireAudit({ actorId: req.user.userId, action: "PRIZE_UPDATED", entityType: "PRIZE", entityId: prize.id, giveawayId: giveaway._id, metadata: { result: "SUCCESS", status: prize.status }, requestId: req.get("x-request-id"), session });
			result = { giveawayId: giveaway.id, prizeId: prize.id, status: prize.status };
		});
		return sendSuccess(res, { message: "Prize updated.", data: result });
	} catch (error) {
		if (["GIVEAWAY_NOT_FOUND", "PRIZE_NOT_FOUND"].includes(error.code)) return sendError(res, { statusCode: error.statusCode, code: error.code, message: error.message });
		return handleAdminGiveawayError(res, error);
	} finally {
		await session.endSession();
	}
}
