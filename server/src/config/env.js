import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
	path: fileURLToPath(new URL("../../.env", import.meta.url)),
	quiet: true,
});

const portValue = process.env.PORT?.trim() || "5000";
const port = Number(portValue);

if (!/^\d+$/.test(portValue) || !Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error("PORT must be an integer between 1 and 65535.");
}

export const env = {
	mongoUri: process.env.MONGO_URI?.trim() ?? "",
	isDemoMode: !process.env.MONGO_URI?.trim() && (process.env.NODE_ENV?.trim() || "development") !== "production",
	port,
	nodeEnv: process.env.NODE_ENV?.trim() || "development",
	clientUrl: process.env.CLIENT_URL?.trim() ?? "",
	jwtSecret: process.env.JWT_SECRET?.trim() ?? "",
	refreshSecret: process.env.REFRESH_SECRET?.trim() ?? "",
	adminUserIds: new Set(
		(process.env.ADMIN_USER_IDS ?? "")
			.split(",")
			.map((userId) => userId.trim())
			.filter(Boolean),
	),
};
