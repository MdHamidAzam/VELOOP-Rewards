import { ApiError, apiRequest } from "./api.js";
import {
	clearStoredAccessToken,
	getStoredAccessToken,
	isAuthenticated,
	setStoredAccessToken,
} from "./authStorage.js";
import { DEMO_MODE, isDemoFallbackError } from "./demoData.js";

export async function devLogin(userId) {
	if (typeof userId !== "string" || !userId.trim()) {
		throw new ApiError("A development user ID is required.", { code: "VALIDATION_ERROR", status: 400 });
	}
	if (DEMO_MODE) {
		const accessToken = `demo-token:${userId.trim()}`;
		setStoredAccessToken(accessToken);
		return { accessToken, demo: true };
	}

	let response;
	try {
		response = await apiRequest("auth/dev-login", { method: "POST", body: JSON.stringify({ userId: userId.trim() }) });
	} catch (error) {
		if (!DEMO_MODE || !isDemoFallbackError(error)) throw error;
		const accessToken = `demo-token:${userId.trim()}`;
		setStoredAccessToken(accessToken);
		return { accessToken, demo: true };
	}
	const accessToken = response?.data?.accessToken;
	if (!response?.success || typeof accessToken !== "string" || !accessToken) {
		throw new ApiError("The authentication API returned an invalid response.", {
			code: "INVALID_RESPONSE",
		});
	}

	setStoredAccessToken(accessToken);
	return { accessToken };
}

export {
	getStoredAccessToken,
	setStoredAccessToken,
	clearStoredAccessToken,
	isAuthenticated,
};
