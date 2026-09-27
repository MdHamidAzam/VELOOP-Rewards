import { useCallback, useState } from "react";
import { useAuthContext } from "../context/AuthContext.jsx";
import {
	clearStoredAccessToken,
	devLogin as requestDevLogin,
	login as requestLogin,
	register as requestRegister,
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

	const login = useCallback(async (email, password) => {
		const result = await requestLogin(email, password);
		setToken(result.accessToken);
		return result;
	}, []);

	const register = useCallback((email, password) => requestRegister(email, password), []);

	const logout = useCallback(() => {
		clearStoredAccessToken();
		setToken(null);
	}, []);

	const fallback = {
		token,
		isAuthenticated: Boolean(token) && hasStoredAuthentication(),
		devLogin,
		login,
		register,
		logout,
	};

	return context ?? fallback;
}
