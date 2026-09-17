import { createContext, useContext, useMemo, useState } from "react";
import { devLogin as requestDevLogin, getStoredAccessToken, clearStoredAccessToken, isAuthenticated as hasStoredAuthentication } from "../services/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => getStoredAccessToken());
	const value = useMemo(() => ({
		token,
		isAuthenticated: Boolean(token) && hasStoredAuthentication(),
		devLogin: async (userId) => {
			const result = await requestDevLogin(userId);
			setToken(result.accessToken);
			return result;
		},
		logout: () => {
			clearStoredAccessToken();
			setToken(null);
		},
	}), [token]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
	return useContext(AuthContext);
}
