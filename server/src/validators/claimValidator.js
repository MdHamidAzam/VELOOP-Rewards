import { body, param } from "express-validator";

const allowedFields = new Set(["name", "phone", "address", "city", "state", "PIN", "email"]);

export const validateClaimRequest = [
	param("giveawayId").trim().notEmpty().withMessage("giveawayId is required."),
	body().custom((payload) => {
		const unexpectedFields = Object.keys(payload ?? {}).filter((field) => !allowedFields.has(field));
		if (unexpectedFields.length > 0) throw new Error(`Unsupported claim fields: ${unexpectedFields.join(", ")}.`);
		return true;
	}),
	body().custom((payload) => {
		if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Claim details are required.");
		return true;
	}),
];

export const validateClaimStatusRequest = [
	param("giveawayId").trim().notEmpty().withMessage("giveawayId is required."),
	param("claimId").trim().notEmpty().withMessage("claimId is required."),
	body().custom((payload) => {
		if (Object.keys(payload ?? {}).some((field) => field !== "status")) throw new Error("Only claim status may be updated.");
		if (!["PROCESSING", "COMPLETED", "EXPIRED"].includes(payload?.status)) throw new Error("Unsupported claim status.");
		return true;
	}),
];
