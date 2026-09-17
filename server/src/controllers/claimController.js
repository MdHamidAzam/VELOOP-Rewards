import { HTTP_STATUS, PARTICIPATION_ERROR_CODES } from "../utils/constants.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { ClaimServiceError, getMyGiveawayStatus, getMyPrizeClaim, submitPrizeClaim, updateClaimStatus } from "../services/claimService.js";

function handleClaimError(res, error) {
	if (error instanceof ClaimServiceError) return sendError(res, { statusCode: error.statusCode, code: error.code, message: error.message });
	console.error("Claim operation failed.");
	return sendError(res, { statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, code: "CLAIM_OPERATION_ERROR", message: "The prize claim could not be processed." });
}

export async function submitClaim(req, res) {
	try {
		const claim = await submitPrizeClaim({ userId: req.user.userId, giveawayId: req.params.giveawayId, payload: req.body });
		return sendSuccess(res, { statusCode: 201, message: "Prize claim submitted.", data: claim });
	} catch (error) {
		return handleClaimError(res, error);
	}
}

export async function getMyClaim(req, res) {
	try {
		const result = await getMyPrizeClaim({ userId: req.user.userId, giveawayId: req.params.giveawayId });
		if (!result) return sendError(res, { statusCode: 404, code: PARTICIPATION_ERROR_CODES.GIVEAWAY_NOT_FOUND, message: "Giveaway not found." });
		return sendSuccess(res, { message: "Prize claim retrieved.", data: result });
	} catch (error) {
		return handleClaimError(res, error);
	}
}

export async function getMyStatus(req, res) {
	try {
		const result = await getMyGiveawayStatus({ userId: req.user.userId, giveawayId: req.params.giveawayId });
		if (!result) return sendError(res, { statusCode: 404, code: PARTICIPATION_ERROR_CODES.GIVEAWAY_NOT_FOUND, message: "Giveaway not found." });
		return sendSuccess(res, { message: "Giveaway participation status retrieved.", data: result });
	} catch (error) {
		return handleClaimError(res, error);
	}
}

export async function updateStatus(req, res) {
	try {
		const claim = await updateClaimStatus({ giveawayId: req.params.giveawayId, claimId: req.params.claimId, status: req.body.status, actorId: req.user.userId });
		return sendSuccess(res, { message: "Claim status updated.", data: claim });
	} catch (error) {
		return handleClaimError(res, error);
	}
}
