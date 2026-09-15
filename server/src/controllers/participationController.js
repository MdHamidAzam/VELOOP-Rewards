import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError } from "../utils/apiResponse.js";

// Contract-only response until the atomic participation transaction is implemented.
export function createParticipation(req, res) {
	return sendError(res, {
		statusCode: HTTP_STATUS.NOT_IMPLEMENTED,
		code: PARTICIPATION_ERROR_CODES.PARTICIPATION_NOT_IMPLEMENTED,
		message: "Participation transactions are not implemented yet.",
		details: {
			method: req.method,
			path: req.originalUrl,
			request: {
				giveawayId: req.params.giveawayId,
				prizeId: req.body.prizeId,
			},
			plannedResponse: {
				success: true,
				message: "Participation created.",
				data: {
					giveawayId: "<giveawayId>",
					prizeId: "<prizeId>",
					entryId: "<entryId>",
					transactionId: "<transactionId>",
				},
			},
		},
	});
}
