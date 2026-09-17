import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError } from "../utils/apiResponse.js";
import { FRAUD_EVENT_TYPES, recordFraudEvent } from "../services/fraudService.js";

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
		void recordFraudEvent({
			userId: req.user?.userId,
			event: FRAUD_EVENT_TYPES.SUSPICIOUS_REQUEST,
			reason: "Forbidden participation fields submitted.",
			riskLevel: "MEDIUM",
			metadata: {
				method: req.method,
				path: req.route?.path ?? req.path,
				fieldNames: tamperedFields,
				reasonCode: "FORBIDDEN_FIELDS",
			},
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
