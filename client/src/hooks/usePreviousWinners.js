import { useCallback, useEffect, useRef, useState } from "react";
import { getPreviousWinners } from "../services/giveawayApi.js";

export function usePreviousWinners() {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const requestId = useRef(0);

	const load = useCallback(async () => {
		const currentRequestId = requestId.current + 1;
		requestId.current = currentRequestId;
		setLoading(true);
		setError(null);

		try {
			const winners = await getPreviousWinners();
			if (requestId.current === currentRequestId) setData(winners);
			return winners;
		} catch (requestError) {
			if (requestId.current === currentRequestId) setError(requestError);
			throw requestError;
		} finally {
			if (requestId.current === currentRequestId) setLoading(false);
		}
	}, []);

	useEffect(() => {
		load().catch(() => undefined);
		return () => { requestId.current += 1; };
	}, [load]);

	return { data, loading, error, reload: load };
}