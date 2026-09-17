import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentGiveaway } from "../services/giveawayApi.js";

export function useGiveaway({ autoLoad = true } = {}) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(autoLoad);
	const [error, setError] = useState(null);
	const requestId = useRef(0);
	const inFlightRequest = useRef(null);

	const load = useCallback(async () => {
		if (inFlightRequest.current) return inFlightRequest.current;

		const currentRequestId = requestId.current + 1;
		requestId.current = currentRequestId;
		setData(null);
		setLoading(true);
		setError(null);

		const request = (async () => {
			const giveaway = await getCurrentGiveaway();
			if (requestId.current === currentRequestId) setData(giveaway);
			return giveaway;
		})()
			.catch((requestError) => {
				if (requestId.current === currentRequestId) setError(requestError);
				throw requestError;
			})
			.finally(() => {
				if (inFlightRequest.current === request) inFlightRequest.current = null;
				if (requestId.current === currentRequestId) setLoading(false);
			});

		inFlightRequest.current = request;
		return request;
	}, []);

	useEffect(() => {
		if (!autoLoad) return undefined;

		let mounted = true;
		load().catch(() => {
			if (!mounted) requestId.current += 1;
		});

		return () => {
			mounted = false;
			requestId.current += 1;
			inFlightRequest.current = null;
		};
	}, [autoLoad, load]);

	return { data, loading, error, reload: load };
}
