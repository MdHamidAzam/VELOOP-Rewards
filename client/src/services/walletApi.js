import { ApiError, apiRequest } from "./api.js";
import { DEMO_MODE, getDemoWallet, isDemoFallbackError } from "./demoData.js";

export const SUPPORTED_CURRENCIES = Object.freeze(["VES", "SVES", "TOKENS"]);

export async function getWallet(currency) {
	if (DEMO_MODE) return getDemoWallet(currency);
	let path = "wallet";
	if (currency !== undefined) {
		if (typeof currency !== "string" || !SUPPORTED_CURRENCIES.includes(currency.trim().toUpperCase())) {
			throw new ApiError("The requested wallet currency is not supported.", {
				code: "CURRENCY_INVALID",
				status: 422,
			});
		}

		path += `?currency=${encodeURIComponent(currency.trim().toUpperCase())}`;
	}

	let response;
	try { response = await apiRequest(path, { authenticated: true }); } catch (error) { if (isDemoFallbackError(error)) return getDemoWallet(); throw error; }
	if (!response?.success || response.data === undefined) {
		throw new ApiError("The wallet API returned an invalid response.", {
			code: "INVALID_RESPONSE",
		});
	}

	return response.data;
}
