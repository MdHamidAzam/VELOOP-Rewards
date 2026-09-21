import { env } from "../config/env.js";
import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import {
	AuthConfigurationError,
	AuthServiceError,
	generateAccessToken,
	loginUser,
	registerUser,
} from "../utils/authService.js";

function handleAuthError(res, error) {
	if (error instanceof AuthServiceError) {
		return sendError(res, {
			statusCode: error.statusCode,
			code: error.code,
			message: error.message,
		});
	}

	if (error instanceof AuthConfigurationError) {
		return sendError(res, {
			statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			code: PARTICIPATION_ERROR_CODES.AUTH_CONFIGURATION_ERROR,
			message: "Authentication is not configured on the server.",
		});
	}

	console.error("Authentication operation failed.");
	return sendError(res, {
		statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
		code: PARTICIPATION_ERROR_CODES.AUTH_CONFIGURATION_ERROR,
		message: "Authentication could not be completed.",
	});
}

export async function register(req, res) {
	try {
		const result = await registerUser({ email: req.body?.email, password: req.body?.password });
		return sendSuccess(res, { statusCode: 201, message: "Account created.", data: result });
	} catch (error) {
		return handleAuthError(res, error);
	}
}

export async function login(req, res) {
	try {
		const result = await loginUser({ email: req.body?.email, password: req.body?.password });
		return sendSuccess(res, { message: "Signed in.", data: result });
	} catch (error) {
		return handleAuthError(res, error);
	}
}

export function devLogin(req, res) {
	if (!["development", "test"].includes(env.nodeEnv)) {
		return sendError(res, {
			statusCode: HTTP_STATUS.NOT_FOUND,
			code: PARTICIPATION_ERROR_CODES.AUTHENTICATION_REQUIRED,
			message: "Development authentication is unavailable.",
		});
	}

	const bodyKeys = Object.keys(req.body ?? {});
	if (bodyKeys.some((key) => key !== "userId") || typeof req.body?.userId !== "string" || !req.body.userId.trim()) {
		return sendError(res, {
			statusCode: HTTP_STATUS.BAD_REQUEST,
			code: PARTICIPATION_ERROR_CODES.VALIDATION_ERROR,
			message: "A userId is required and no other fields are accepted.",
		});
	}

	try {
		const accessToken = generateAccessToken({ userId: req.body.userId });
		return sendSuccess(res, {
			message: "Development access token created.",
			data: { accessToken, tokenType: "Bearer" },
		});
	} catch (error) {
		if (error instanceof AuthConfigurationError) {
			return sendError(res, {
				statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
				code: PARTICIPATION_ERROR_CODES.AUTH_CONFIGURATION_ERROR,
				message: "Authentication is not configured on the server.",
			});
		}

		return sendError(res, {
			statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			code: PARTICIPATION_ERROR_CODES.AUTH_CONFIGURATION_ERROR,
			message: "Access token could not be created.",
		});
	}
}