import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError } from "../utils/apiResponse.js";

export function requireAuthenticatedUser(req, res, next) {
	if (!req.user) {
		return sendError(res, {
			statusCode: HTTP_STATUS.UNAUTHORIZED,
			code: PARTICIPATION_ERROR_CODES.AUTHENTICATION_REQUIRED,
			message: "Authentication is required to participate.",
		});
	}

	next();
}
