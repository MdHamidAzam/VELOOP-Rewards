import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError } from "../utils/apiResponse.js";

export function participationFraudGuard(req, res, next) {
	if (req.participationFraudRejected) {
		return sendError(res, {
			statusCode: HTTP_STATUS.FORBIDDEN,
			code: PARTICIPATION_ERROR_CODES.FRAUD_REJECTED,
			message: "Participation was rejected by the fraud review layer.",
		});
	}

	next();
}
