import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import User from "../models/User.js";

const PASSWORD_MIN_LENGTH = 8;

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

function normalizeEmail(email) {
	if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
		throw new AuthServiceError("A valid email and password are required.", 400);
	}

	return email.trim().toLowerCase();
}

function validatePassword(password) {
	if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
		throw new AuthServiceError("A valid email and password are required.", 400);
	}
}

class AuthServiceError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.name = "AuthServiceError";
		this.statusCode = statusCode;
		this.code = statusCode === 409 ? "AUTH_ACCOUNT_EXISTS" : "AUTH_VALIDATION_ERROR";
	}
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
		if (!['development', 'test'].includes(env.nodeEnv)) {
			throw new jwt.JsonWebTokenError("Development tokens are unavailable.");
		}

		const userId = token.slice("demo-token:".length).trim();
		if (!userId) {
			throw new jwt.JsonWebTokenError("Token identity is invalid.");
		}
		return { userId, isDemoToken: true };
	}

	const payload = jwt.verify(token, getJwtSecret());

	if (!payload || typeof payload !== "object" || typeof payload.userId !== "string" || !payload.userId.trim()) {
		throw new jwt.JsonWebTokenError("Token identity is invalid.");
	}

	return { userId: payload.userId.trim(), isDemoToken: false };
}

export async function registerUser({ email, password }) {
	const normalizedEmail = normalizeEmail(email);
	validatePassword(password);

	try {
		const user = await User.create({
			userId: `USR-${randomUUID()}`,
			email: normalizedEmail,
			passwordHash: await bcrypt.hash(password, 12),
			status: "ACTIVE",
			role: "USER",
		});

		return {
			userId: user.userId,
			email: user.email,
			accessToken: generateAccessToken({ userId: user.userId }),
			tokenType: "Bearer",
		};
	} catch (error) {
		if (error?.code === 11000) throw new AuthServiceError("An account already exists for that email.", 409);
		throw error;
	}
}

export async function loginUser({ email, password }) {
	const normalizedEmail = normalizeEmail(email);
	validatePassword(password);
	const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash").lean();

	if (!user || user.status !== "ACTIVE" || !(await bcrypt.compare(password, user.passwordHash))) {
		throw new AuthServiceError("Invalid email or password.", 401);
	}

	return {
		userId: user.userId,
		email: user.email,
		accessToken: generateAccessToken({ userId: user.userId }),
		tokenType: "Bearer",
	};
}

export { AuthConfigurationError, AuthServiceError };
