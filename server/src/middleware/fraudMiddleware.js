import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError } from "../utils/apiResponse.js";
import { FRAUD_EVENT_TYPES, recordFraudEvent } from "../services/fraudService.js";
import { recordAuditLog } from "../services/auditService.js";
import { randomUUID } from "node:crypto";

const FORBIDDEN_PARTICIPATION_FIELDS = new Set([
	"userId",
	"amount",
	"fee",
	"currency",
	"balance",
	"transactionId",
	"walletId",
]);

export async function participationFraudGuard(req, res, next) {
	const submittedFields = Object.keys(req.body ?? {});
	const tamperedFields = submittedFields.filter((field) => FORBIDDEN_PARTICIPATION_FIELDS.has(field));
	if (tamperedFields.length > 0) {
		const eventId = randomUUID();
		const eventRecorded = await recordFraudEvent({
			userId: req.user?.userId,
			event: FRAUD_EVENT_TYPES.SUSPICIOUS_REQUEST,
			reason: "Forbidden participation fields submitted.",
			riskLevel: "MEDIUM",
			riskScore: 45,
			action: "BLOCKED",
			metadata: {
				method: req.method,
				path: req.route?.path ?? req.path,
				fieldNames: tamperedFields,
				reasonCode: "FORBIDDEN_FIELDS",
			},
		});
		const auditRecorded = await recordAuditLog({
			actorId: req.user?.userId,
			action: "PARTICIPATION_BLOCKED",
			entityType: "FRAUD",
			entityId: eventId,
			metadata: { result: "BLOCKED", status: "OPEN", reasonCode: "FORBIDDEN_FIELDS", riskLevel: "MEDIUM", riskScore: 45, action: "BLOCKED" },
			requestId: req.get("x-request-id"),
		});
		if (!eventRecorded || !auditRecorded) {
			return sendError(res, {
				statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
				code: PARTICIPATION_ERROR_CODES.PARTICIPATION_ERROR,
				message: "Participation could not be completed.",
			});
		}
		return sendError(res, {
			statusCode: HTTP_STATUS.FORBIDDEN,
			code: PARTICIPATION_ERROR_CODES.FRAUD_REJECTED,
			message: "Participation was rejected by the fraud review layer.",
		});
	}

	if (req.participationFraudRejected) {
		return sendError(res, {
			statusCode: HTTP_STATUS.FORBIDDEN,
			code: PARTICIPATION_ERROR_CODES.FRAUD_REJECTED,
			message: "Participation was rejected by the fraud review layer.",
		});
	}

	next();
}
