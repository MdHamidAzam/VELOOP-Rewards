import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError } from "../utils/apiResponse.js";
import { AuthConfigurationError, verifyAccessToken } from "../utils/authService.js";
import { env } from "../config/env.js";
import User from "../models/User.js";

export async function requireAuthenticatedUser(req, res, next) {
	const authorization = req.get("authorization");
	const [scheme, token] = authorization?.split(" ") ?? [];

	if (scheme !== "Bearer" || !token || token.includes(" ")) {
		return sendError(res, {
			statusCode: HTTP_STATUS.UNAUTHORIZED,
			code: PARTICIPATION_ERROR_CODES.AUTHENTICATION_INVALID,
			message: "A valid access token is required.",
		});
	}

	try {
		req.user = verifyAccessToken(token);
		if (!req.user.isDemoToken) {
			const user = await User.findOne({ userId: req.user.userId, status: "ACTIVE" }).select("_id").lean();
			if (!user) {
				return sendError(res, {
					statusCode: HTTP_STATUS.UNAUTHORIZED,
					code: PARTICIPATION_ERROR_CODES.AUTHENTICATION_INVALID,
					message: "A valid access token is required.",
				});
			}
		}
		return next();
	} catch (error) {
		if (error instanceof AuthConfigurationError) {
			return sendError(res, {
				statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
				code: PARTICIPATION_ERROR_CODES.AUTH_CONFIGURATION_ERROR,
				message: "Authentication is not configured on the server.",
			});
		}

		return sendError(res, {
			statusCode: HTTP_STATUS.UNAUTHORIZED,
			code: PARTICIPATION_ERROR_CODES.AUTHENTICATION_INVALID,
			message: "A valid access token is required.",
		});
	}
}

export function requireAdminUser(req, res, next) {
	if (!req.user?.userId || !env.adminUserIds.has(req.user.userId)) {
		return sendError(res, {
			statusCode: HTTP_STATUS.FORBIDDEN,
			code: "ADMIN_AUTHORIZATION_REQUIRED",
			message: "Administrator authorization is required.",
		});
	}

	return next();
}
