const ACCESS_TOKEN_KEY = "veloop.accessToken";

export function getStoredAccessToken() {
	try {
		return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
	} catch {
		return null;
	}
}

export function setStoredAccessToken(token) {
	if (typeof token !== "string" || !token.trim()) throw new TypeError("A valid access token is required.");

	try {
		window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
	} catch {
		throw new Error("Access token storage is unavailable.");
	}
}

export function clearStoredAccessToken() {
	try {
		window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
	} catch {
		// Storage may be unavailable in restricted browser contexts.
	}
}

export function isAuthenticated() {
	return Boolean(getStoredAccessToken());
}
