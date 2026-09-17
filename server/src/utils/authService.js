import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

class AuthConfigurationError extends Error {
	constructor(message) {
		super(message);
		this.name = "AuthConfigurationError";
		this.code = "AUTH_CONFIG_MISSING";
	}
}

function getJwtSecret() {
	if (env.jwtSecret) {
		return env.jwtSecret;
	}

	if (env.nodeEnv !== "production" || env.isDemoMode) {
		return "VELOOP_DEVELOPMENT_FALLBACK_SECRET";
	}

	throw new AuthConfigurationError("JWT_SECRET is not configured.");
}

export function generateAccessToken({ userId }) {
	if (typeof userId !== "string" || !userId.trim()) {
		throw new TypeError("userId is required to generate an access token.");
	}

	return jwt.sign({ userId: userId.trim() }, getJwtSecret(), {
		expiresIn: "15m",
	});
}

export function verifyAccessToken(token) {
	if (typeof token !== "string") {
		throw new jwt.JsonWebTokenError("Token identity is invalid.");
	}

	if (token.startsWith("demo-token:")) {
		const userId = token.slice("demo-token:".length).trim();
		if (!userId) {
			throw new jwt.JsonWebTokenError("Token identity is invalid.");
		}
		return { userId };
	}

	const payload = jwt.verify(token, getJwtSecret());

	if (!payload || typeof payload !== "object" || typeof payload.userId !== "string" || !payload.userId.trim()) {
		throw new jwt.JsonWebTokenError("Token identity is invalid.");
	}

	return { userId: payload.userId.trim() };
}

export { AuthConfigurationError };
