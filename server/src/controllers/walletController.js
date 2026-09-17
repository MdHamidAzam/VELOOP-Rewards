import { HTTP_STATUS, WALLET_ERROR_CODES } from "../utils/constants.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { getAuthoritativeBalance, WalletServiceError } from "../services/walletService.js";

export async function getWallet(req, res) {
	try {
		const wallet = await getAuthoritativeBalance(req.user.userId, req.query.currency);
		return sendSuccess(res, {
			message: "Wallet balance retrieved.",
			data: wallet,
		});
	} catch (error) {
		if (error instanceof WalletServiceError) {
			return sendError(res, {
				statusCode: error.statusCode,
				code: WALLET_ERROR_CODES[error.code] ?? WALLET_ERROR_CODES.WALLET_READ_ERROR,
				message: error.message,
			});
		}

		console.error(`Wallet read failed: ${error.message}`);
		return sendError(res, {
			statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			code: WALLET_ERROR_CODES.WALLET_READ_ERROR,
			message: "Wallet balance could not be loaded.",
		});
	}
}