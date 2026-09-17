import { useCallback, useState } from "react";
import { useAuthContext } from "../context/AuthContext.jsx";
import {
	clearStoredAccessToken,
	devLogin as requestDevLogin,
	getStoredAccessToken,
	isAuthenticated as hasStoredAuthentication,
} from "../services/authApi.js";

export function useAuth() {
	const context = useAuthContext();
	const [token, setToken] = useState(() => getStoredAccessToken());

	const devLogin = useCallback(async (userId) => {
		const result = await requestDevLogin(userId);
		setToken(result.accessToken);
		return result;
	}, []);

	const logout = useCallback(() => {
		clearStoredAccessToken();
		setToken(null);
	}, []);

	const fallback = {
		token,
		isAuthenticated: Boolean(token) && hasStoredAuthentication(),
		devLogin,
		logout,
	};

	return context ?? fallback;
}
