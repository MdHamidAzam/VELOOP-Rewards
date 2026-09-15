import { body, param } from "express-validator";

const allowedBodyFields = new Set(["prizeId"]);

export const validateParticipationRequest = [
	param("giveawayId")
		.trim()
		.notEmpty()
		.withMessage("giveawayId is required."),
	body().custom((requestBody) => {
		const unexpectedFields = Object.keys(requestBody ?? {}).filter((field) => !allowedBodyFields.has(field));

		if (unexpectedFields.length > 0) {
			throw new Error(`Unsupported participation fields: ${unexpectedFields.join(", ")}.`);
		}

		return true;
	}),
	body("prizeId")
		.trim()
		.notEmpty()
		.withMessage("prizeId is required.")
		.isString()
		.withMessage("prizeId must be a string."),
];
