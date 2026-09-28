import { body, param } from "express-validator";

const GIVEAWAY_FIELDS = new Set([
	"id", "title", "slug", "description", "status", "startAt", "endAt", "rules", "eligibility", "participationSettings",
]);
const PRIZE_FIELDS = new Set([
	"id", "name", "position", "image", "description", "winnerCount", "prizeType", "claimType", "entryCurrency", "entryAmount", "status",
]);
const PRIZE_UPDATE_FIELDS = new Set([...PRIZE_FIELDS].filter((field) => field !== "id"));
const GIVEAWAY_STATUSES = ["UPCOMING", "ACTIVE", "ENDED", "ARCHIVED"];
const PRIZE_TYPES = ["PHYSICAL", "GIFT_CARD", "DIGITAL"];
const CLAIM_TYPES = ["PHYSICAL", "EMAIL", "GIFT_CARD", "DIGITAL"];
const CURRENCIES = ["VES", "SVES", "TOKENS"];

function rejectUnknownFields(allowedFields, label) {
	return body().custom((payload) => {
		if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error(`${label} must be an object.`);
		const unexpected = Object.keys(payload).filter((field) => !allowedFields.has(field));
		if (unexpected.length) throw new Error(`Unsupported ${label} fields: ${unexpected.join(", ")}.`);
		return true;
	});
}

function validateGiveawayDateOrder() {
	return body().custom((_, { req }) => {
		const startAt = new Date(req.body?.startAt);
		const endAt = new Date(req.body?.endAt);
		if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || startAt >= endAt) {
			throw new Error("startAt must be before endAt.");
		}
		return true;
	});
}

function validateNestedGiveawayConfig() {
	return body().custom((_, { req }) => {
		const { eligibility, participationSettings, rules } = req.body ?? {};
		if (rules !== undefined && (!Array.isArray(rules) || rules.some((rule) => typeof rule !== "string"))) {
			throw new Error("rules must be an array of strings.");
		}
		if (eligibility !== undefined) {
			if (!eligibility || typeof eligibility !== "object" || Array.isArray(eligibility)) throw new Error("eligibility must be an object.");
			if (Object.keys(eligibility).some((key) => !["minAge", "countries", "requiresVerifiedUser"].includes(key))) throw new Error("eligibility contains unsupported fields.");
			if (eligibility.minAge !== undefined && (!Number.isInteger(eligibility.minAge) || eligibility.minAge < 0)) throw new Error("eligibility.minAge must be a non-negative integer.");
			if (eligibility.countries !== undefined && (!Array.isArray(eligibility.countries) || eligibility.countries.some((country) => typeof country !== "string"))) throw new Error("eligibility.countries must be an array of country codes.");
			if (eligibility.requiresVerifiedUser !== undefined && typeof eligibility.requiresVerifiedUser !== "boolean") throw new Error("eligibility.requiresVerifiedUser must be a boolean.");
		}
		if (participationSettings !== undefined) {
			if (!participationSettings || typeof participationSettings !== "object" || Array.isArray(participationSettings)) throw new Error("participationSettings must be an object.");
			if (Object.keys(participationSettings).some((key) => !["maxParticipationsPerUser", "entryCurrency", "entryAmount"].includes(key))) throw new Error("participationSettings contains unsupported fields.");
			if (participationSettings.maxParticipationsPerUser !== undefined && (!Number.isInteger(participationSettings.maxParticipationsPerUser) || participationSettings.maxParticipationsPerUser < 1)) throw new Error("maxParticipationsPerUser must be a positive integer.");
			if (participationSettings.entryCurrency !== undefined && !CURRENCIES.includes(participationSettings.entryCurrency)) throw new Error("entryCurrency is unsupported.");
			if (participationSettings.entryAmount !== undefined && (!Number.isFinite(participationSettings.entryAmount) || participationSettings.entryAmount < 0)) throw new Error("entryAmount must be non-negative.");
		}
		return true;
	});
}

function validatePrizeFields({ requireAll = false } = {}) {
	return [
		body("id").optional().trim().matches(/^[A-Za-z0-9_-]+$/),
		body("name")[requireAll ? "notEmpty" : "optional"]().trim().isLength({ max: 200 }),
		body("position")[requireAll ? "notEmpty" : "optional"]().isInt({ min: 1 }).toInt(),
		body("image").optional({ nullable: true }).isString().isLength({ max: 2048 }),
		body("description").optional({ nullable: true }).isString().isLength({ max: 2000 }),
		body("winnerCount")[requireAll ? "notEmpty" : "optional"]().isInt({ min: 1 }).toInt(),
		body("prizeType")[requireAll ? "notEmpty" : "optional"]().isIn(PRIZE_TYPES),
		body("claimType")[requireAll ? "notEmpty" : "optional"]().isIn(CLAIM_TYPES),
		body("entryCurrency")[requireAll ? "notEmpty" : "optional"]().isIn(CURRENCIES),
		body("entryAmount")[requireAll ? "notEmpty" : "optional"]().isFloat({ min: 0 }).toFloat(),
		body("status").optional().isIn(["AVAILABLE", "RESERVED", "AWARDED", "UNAVAILABLE"]),
	];
}

export const validateCreateGiveaway = [
	rejectUnknownFields(GIVEAWAY_FIELDS, "giveaway"),
	body("id").trim().notEmpty().matches(/^[A-Za-z0-9_-]+$/),
	body("title").trim().notEmpty().isLength({ max: 200 }),
	body("slug").trim().notEmpty().matches(/^[a-z0-9-]+$/),
	body("description").trim().notEmpty().isLength({ max: 4000 }),
	body("status").isIn(GIVEAWAY_STATUSES),
	body("startAt").isISO8601().toDate(),
	body("endAt").isISO8601().toDate(),
	body("rules").optional().isArray(),
	body("eligibility").optional().isObject(),
	body("participationSettings").optional().isObject(),
	validateGiveawayDateOrder(),
	validateNestedGiveawayConfig(),
];

export const validateUpdateGiveaway = [
	param("giveawayId").trim().notEmpty(),
	rejectUnknownFields(new Set(["title", "slug", "description", "status", "startAt", "endAt", "rules", "eligibility", "participationSettings"]), "giveaway"),
	body().custom((payload) => { if (Object.keys(payload).length === 0) throw new Error("At least one giveaway field is required."); return true; }),
	body("title").optional().trim().notEmpty().isLength({ max: 200 }),
	body("slug").optional().trim().notEmpty().matches(/^[a-z0-9-]+$/),
	body("description").optional().trim().notEmpty().isLength({ max: 4000 }),
	body("status").optional().isIn(GIVEAWAY_STATUSES),
	body("startAt").optional().isISO8601().toDate(),
	body("endAt").optional().isISO8601().toDate(),
	body("rules").optional().isArray(),
	body("eligibility").optional().isObject(),
	body("participationSettings").optional().isObject(),
	validateNestedGiveawayConfig(),
];

export const validateCreatePrize = [
	param("giveawayId").trim().notEmpty(),
	rejectUnknownFields(PRIZE_FIELDS, "prize"),
	...validatePrizeFields({ requireAll: true }),
];

export const validateUpdatePrize = [
	param("giveawayId").trim().notEmpty(),
	param("prizeId").trim().notEmpty(),
	rejectUnknownFields(PRIZE_UPDATE_FIELDS, "prize"),
	body().custom((payload) => { if (Object.keys(payload).length === 0) throw new Error("At least one prize field is required."); return true; }),
	...validatePrizeFields(),
];
