import { clearStoredAccessToken, getStoredAccessToken } from "./authStorage.js";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");

export class ApiError extends Error {
	constructor(message, { status, code, details } = {}) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

async function parseResponse(response) {
	const contentType = response.headers.get("content-type") ?? "";
	if (!contentType.includes("application/json")) return null;

	try {
		return await response.json();
	} catch {
		return null;
	}
}

export async function apiRequest(path, options = {}) {
	const normalizedPath = path.replace(/^\/+/, "");
	const { authenticated = false, headers = {}, ...fetchOptions } = options;
	const accessToken = authenticated ? getStoredAccessToken() : null;
	if (authenticated && !accessToken) {
		throw new ApiError("Authentication is required.", {
			status: 401,
			code: "AUTHENTICATION_REQUIRED",
		});
	}

	let response;
	try {
		response = await fetch(`${API_BASE_URL}/${normalizedPath}`, {
			...fetchOptions,
			headers: {
				Accept: "application/json",
				...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
				...headers,
			},
		});
	} catch {
		throw new ApiError("The API could not be reached.", { code: "NETWORK_ERROR" });
	}
	const payload = await parseResponse(response);

	if (!response.ok) {
		if (response.status === 401) clearStoredAccessToken();
		const backendError = payload?.error;
		throw new ApiError(backendError?.message || `Request failed with status ${response.status}.`, {
			status: response.status,
			code: backendError?.code,
			details: backendError?.details,
		});
	}

	return payload;
}
