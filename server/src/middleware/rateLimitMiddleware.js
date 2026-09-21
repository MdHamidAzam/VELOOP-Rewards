import { rateLimit } from "express-rate-limit";
import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError } from "../utils/apiResponse.js";
import { FRAUD_EVENT_TYPES, recordFraudEvent } from "../services/fraudService.js";

export const participationRateLimiter = rateLimit({
	limit: 5,
	windowMs: 60 * 1000,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	handler: (req, res) => {
		void recordFraudEvent({
			userId: req.user?.userId,
			event: FRAUD_EVENT_TYPES.EXCESSIVE_REQUESTS,
			reason: "Participation request rate limit exceeded.",
			riskLevel: "MEDIUM",
			metadata: { method: req.method, path: req.path, reasonCode: "RATE_LIMITED" },
		});

		return sendError(res, {
			statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
			code: PARTICIPATION_ERROR_CODES.RATE_LIMITED,
			message: "Too many participation requests. Please try again later.",
		});
	},
});

export const claimRateLimiter = rateLimit({
	limit: 5,
	windowMs: 60 * 1000,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	handler: (req, res) => sendError(res, {
		statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
		code: PARTICIPATION_ERROR_CODES.RATE_LIMITED,
		message: "Too many claim requests. Please try again later.",
	}),
});

export const authRateLimiter = rateLimit({
	limit: 10,
	windowMs: 60 * 1000,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	handler: (req, res) => sendError(res, {
		statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
		code: PARTICIPATION_ERROR_CODES.RATE_LIMITED,
		message: "Too many authentication requests. Please try again later.",
	}),
});
