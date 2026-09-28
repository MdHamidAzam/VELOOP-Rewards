import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError } from "../utils/apiResponse.js";
import { createParticipation as createParticipationTransaction, ParticipationServiceError } from "../services/participationService.js";
import { FRAUD_EVENT_TYPES, recordFraudEvent } from "../services/fraudService.js";
import { recordAuditLog } from "../services/auditService.js";
import { createHash } from "node:crypto";

function getDeviceHash(req) {
	const fingerprint = [req.get("user-agent") ?? "", req.get("x-device-id") ?? "", req.ip ?? ""].join("|");
	return createHash("sha256").update(fingerprint).digest("hex");
}

export async function createParticipation(req, res) {
	try {
		const result = await createParticipationTransaction({
			userId: req.user.userId,
			giveawayId: req.params.giveawayId,
			prizeId: req.body.prizeId,
			idempotencyKey: req.get("x-idempotency-key"),
			deviceHash: getDeviceHash(req),
			requestId: req.get("x-request-id"),
		});
		const { auditContext, ...data } = result;

		void recordAuditLog({
			actorId: req.user.userId,
			action: "PARTICIPATION_CREATED",
			entityType: "PARTICIPATION",
			entityId: auditContext.entityId,
			giveawayId: auditContext.giveawayObjectId,
			metadata: { result: "SUCCESS", status: "COMPLETED", method: req.method, path: req.path },
			requestId: req.get("x-request-id"),
		});

		return res.status(201).json({
			success: true,
			message: "Participation created.",
			data,
		});
	} catch (error) {
		if (error instanceof ParticipationServiceError) {
			if (error.code === "DUPLICATE_PARTICIPATION") {
				void recordFraudEvent({
					userId: req.user?.userId,
					event: FRAUD_EVENT_TYPES.DUPLICATE_PARTICIPATION,
					reason: "Repeated participation attempt for the same giveaway.",
					riskLevel: "MEDIUM",
					metadata: { method: req.method, path: req.path, reasonCode: error.code },
				});
			}

			return sendError(res, {
				statusCode: error.statusCode,
				code: PARTICIPATION_ERROR_CODES[error.code] ?? error.code,
				message: error.message,
			});
		}

		console.error("Participation transaction failed.");
		return sendError(res, {
			statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			code: PARTICIPATION_ERROR_CODES.PARTICIPATION_ERROR,
			message: "Participation could not be completed.",
		});
	}
}
