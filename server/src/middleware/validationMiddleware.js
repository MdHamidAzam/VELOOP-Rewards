import { validationResult } from "express-validator";
import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError } from "../utils/apiResponse.js";

export function validateRequest(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return sendError(res, {
			statusCode: HTTP_STATUS.BAD_REQUEST,
			code: PARTICIPATION_ERROR_CODES.VALIDATION_ERROR,
			message: "The participation request is invalid.",
			details: errors.array(),
		});
	}

	next();
}
