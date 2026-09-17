import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import {
	getCurrentGiveaway,
	getGiveawayById,
	getPreviousGiveaways,
} from "../services/giveawayService.js";

function handleGiveawayError(res, error) {
	console.error(`Giveaway read failed: ${error.message}`);
	return sendError(res, {
		statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
		code: PARTICIPATION_ERROR_CODES.GIVEAWAY_READ_ERROR,
		message: "Giveaway data could not be loaded.",
	});
}

export async function getCurrentGiveawayController(req, res) {
	try {
		const giveaway = await getCurrentGiveaway();
		if (!giveaway) {
			return sendError(res, {
				statusCode: HTTP_STATUS.NOT_FOUND,
				code: PARTICIPATION_ERROR_CODES.GIVEAWAY_NOT_FOUND,
				message: "No active giveaway found.",
			});
		}

		return sendSuccess(res, { message: "Current giveaway retrieved.", data: giveaway });
	} catch (error) {
		return handleGiveawayError(res, error);
	}
}

export async function getGiveawayController(req, res) {
	try {
		const giveaway = await getGiveawayById(req.params.giveawayId);
		if (!giveaway) {
			return sendError(res, {
				statusCode: HTTP_STATUS.NOT_FOUND,
				code: PARTICIPATION_ERROR_CODES.GIVEAWAY_NOT_FOUND,
				message: "Giveaway not found.",
			});
		}

		return sendSuccess(res, { message: "Giveaway retrieved.", data: giveaway });
	} catch (error) {
		return handleGiveawayError(res, error);
	}
}

export async function getPreviousGiveawaysController(req, res) {
	try {
		const giveaways = await getPreviousGiveaways();
		return sendSuccess(res, { message: "Previous giveaways retrieved.", data: giveaways });
	} catch (error) {
		return handleGiveawayError(res, error);
	}
}
