import AuditLog from "../models/AuditLog.js";

const SAFE_METADATA_KEYS = new Set(["result", "status", "reasonCode", "method", "path", "claimType"]);

function sanitizeMetadata(metadata) {
	if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return undefined;

	const safeMetadata = {};
	for (const key of SAFE_METADATA_KEYS) {
		const value = metadata[key];
		if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
			safeMetadata[key] = value;
		}
	}

	return Object.keys(safeMetadata).length > 0 ? safeMetadata : undefined;
}

export async function recordAuditLog({
	actorId,
	action,
	entityType,
	entityId,
	giveawayId,
	metadata,
	requestId,
	session,
}) {
	try {
		await AuditLog.create([{
			actorId: typeof actorId === "string" ? actorId.trim() : undefined,
			action,
			entityType,
			entityId: String(entityId),
			giveawayId,
			metadata: sanitizeMetadata(metadata),
			requestId: typeof requestId === "string" ? requestId.trim() : undefined,
		}], session ? { session } : undefined);
		return true;
	} catch (error) {
		console.error("Audit log recording failed.");
		return false;
	}
}