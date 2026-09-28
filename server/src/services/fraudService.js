import FraudEvent from "../models/FraudEvent.js";

export const FRAUD_EVENT_TYPES = Object.freeze({
	DUPLICATE_PARTICIPATION: "DUPLICATE_PARTICIPATION",
	EXCESSIVE_REQUESTS: "EXCESSIVE_REQUESTS",
	REPLAY_ATTEMPT: "REPLAY_ATTEMPT",
	SUSPICIOUS_REQUEST: "SUSPICIOUS_REQUEST",
	INVALID_IDENTITY: "INVALID_IDENTITY",
});

const SAFE_METADATA_KEYS = new Set(["method", "path", "reasonCode", "fieldNames", "statusCode"]);

function sanitizeMetadata(metadata) {
	if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return undefined;

	const safeMetadata = {};
	for (const key of SAFE_METADATA_KEYS) {
		const value = metadata[key];
		if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
			safeMetadata[key] = value;
		} else if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
			safeMetadata[key] = value.slice(0, 20);
		}
	}

	return Object.keys(safeMetadata).length > 0 ? safeMetadata : undefined;
}

export async function recordFraudEvent({
	userId,
	giveawayObjectId,
	deviceHash,
	networkHash,
	event,
	reason,
	riskLevel = "MEDIUM",
	riskScore,
	action,
	metadata,
	session,
}) {
	try {
		const eventData = {
			userId: typeof userId === "string" ? userId.trim() : undefined,
			giveawayId: giveawayObjectId,
			deviceHash,
			networkHash,
			event,
			risk: { level: riskLevel, score: riskScore },
			action,
			reason,
			metadata: sanitizeMetadata(metadata),
		};

		await FraudEvent.create([eventData], session ? { session } : undefined);
		return true;
	} catch (error) {
		console.error("Fraud event recording failed.");
		return false;
	}
}
