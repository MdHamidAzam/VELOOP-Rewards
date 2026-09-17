import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../services/api.js";
import { isAuthenticated } from "../services/authApi.js";
import { getWallet } from "../services/walletApi.js";

export function useWallet({ currency, enabled = true, autoLoad = true } = {}) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(Boolean(autoLoad && enabled && isAuthenticated()));
	const [error, setError] = useState(null);
	const requestId = useRef(0);
	const inFlightRequest = useRef(null);

	const clear = useCallback(() => {
		requestId.current += 1;
		inFlightRequest.current = null;
		setData(null);
		setLoading(false);
		setError(null);
	}, []);

	const load = useCallback(async (requestedCurrency) => {
		if (!enabled || !isAuthenticated()) {
			clear();
			setError(new ApiError("Authentication is required to view the wallet.", {
				status: 401,
				code: "AUTHENTICATION_REQUIRED",
			}));
			return null;
		}
		if (inFlightRequest.current) return inFlightRequest.current;

		const currentRequestId = requestId.current + 1;
		requestId.current = currentRequestId;
		setData(null);
		setLoading(true);
		setError(null);

		const request = getWallet(requestedCurrency ?? currency)
			.then((wallet) => {
				if (requestId.current === currentRequestId) setData(wallet);
				return wallet;
			})
			.catch((requestError) => {
				if (requestId.current === currentRequestId) {
					setData(null);
					setError(requestError);
				}
				throw requestError;
			})
			.finally(() => {
				if (inFlightRequest.current === request) inFlightRequest.current = null;
				if (requestId.current === currentRequestId) setLoading(false);
			});

		inFlightRequest.current = request;
		return request;
	}, [clear, currency, enabled]);

	useEffect(() => {
		if (!autoLoad) return undefined;
		if (!enabled || !isAuthenticated()) {
			clear();
			return undefined;
		}

		let mounted = true;
		load().catch(() => {
			if (!mounted) requestId.current += 1;
		});

		return () => {
			mounted = false;
			requestId.current += 1;
			inFlightRequest.current = null;
		};
	}, [autoLoad, clear, enabled, load]);

	return { data, loading, error, reload: load, clear };
}