import { HTTP_STATUS } from "../utils/constants.js";
import { sendError } from "../utils/apiResponse.js";

export function errorMiddleware(error, req, res, next) {
	if (res.headersSent) return next(error);

	if (error?.type === "entity.too.large") {
		return sendError(res, {
			statusCode: HTTP_STATUS.BAD_REQUEST,
			code: "PAYLOAD_TOO_LARGE",
			message: "The request payload is too large.",
		});
	}

	console.error("Unhandled API error.");
	return sendError(res, {
		statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
		code: "INTERNAL_SERVER_ERROR",
		message: "The request could not be completed.",
	});
}
