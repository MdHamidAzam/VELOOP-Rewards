import { HTTP_STATUS } from "../utils/constants.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import {
	finalizeGiveaway,
	getGiveawayWinners,
	getPreviousWinners,
	WinnerServiceError,
} from "../services/winnerService.js";

function handleWinnerError(res, error) {
	if (error instanceof WinnerServiceError) {
		return sendError(res, {
			statusCode: error.statusCode,
			code: error.code,
			message: error.message,
		});
	}

	console.error("Winner operation failed.");
	return sendError(res, {
		statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
		code: "WINNER_OPERATION_ERROR",
		message: "Winner information could not be processed.",
	});
}

export async function getGiveawayWinnersController(req, res) {
	try {
		const winners = await getGiveawayWinners(req.params.giveawayId);
		if (!winners) {
			return sendError(res, {
				statusCode: HTTP_STATUS.NOT_FOUND,
				code: "GIVEAWAY_NOT_FOUND",
				message: "Giveaway not found.",
			});
		}

		return sendSuccess(res, { message: "Giveaway winners retrieved.", data: winners });
	} catch (error) {
		return handleWinnerError(res, error);
	}
}

export async function getPreviousWinnersController(req, res) {
	try {
		const winners = await getPreviousWinners();
		return sendSuccess(res, { message: "Previous winners retrieved.", data: winners });
	} catch (error) {
		return handleWinnerError(res, error);
	}
}

export async function finalizeGiveawayController(req, res) {
	try {
		const result = await finalizeGiveaway({
			giveawayId: req.params.giveawayId,
			actorId: req.user.userId,
			requestId: req.get("x-request-id"),
		});

		return sendSuccess(res, {
			message: "Giveaway winners finalized.",
			data: result,
		});
	} catch (error) {
		return handleWinnerError(res, error);
	}
}// Backend implementation will be added later.
