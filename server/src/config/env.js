import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
	path: fileURLToPath(new URL("../../.env", import.meta.url)),
	quiet: true,
});

const portValue = process.env.PORT?.trim() || "5000";
const port = Number(portValue);
const nodeEnv = process.env.NODE_ENV?.trim() || "development";
const mongoUri = process.env.MONGO_URI?.trim() ?? "";
const jwtSecret = process.env.JWT_SECRET?.trim() ?? "";

if (!/^\d+$/.test(portValue) || !Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error("PORT must be an integer between 1 and 65535.");
}

if (nodeEnv === "production" && (!mongoUri || !jwtSecret)) {
	throw new Error("MONGO_URI and JWT_SECRET are required in production.");
}

export const env = {
	mongoUri,
	isDemoMode: !mongoUri && nodeEnv !== "production",
	port,
	nodeEnv,
	clientUrl: process.env.CLIENT_URL?.trim() ?? "",
	jwtSecret,
	refreshSecret: process.env.REFRESH_SECRET?.trim() ?? "",
	adminUserIds: new Set(
		(process.env.ADMIN_USER_IDS ?? "")
			.split(",")
			.map((userId) => userId.trim())
			.filter(Boolean),
	),
};
