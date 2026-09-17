import { useCallback, useEffect, useState } from "react";
import { getMyGiveawayStatus } from "../services/claimApi.js";

export function useGiveawayStatus(giveawayId, enabled) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(Boolean(enabled));
	const [error, setError] = useState(null);

	const load = useCallback(async () => {
		if (!enabled || !giveawayId) {
			setData(null);
			setLoading(false);
			return null;
		}
		setLoading(true);
		setError(null);
		try {
			const status = await getMyGiveawayStatus(giveawayId);
			setData(status);
			return status;
		} catch (requestError) {
			setError(requestError);
			throw requestError;
		} finally {
			setLoading(false);
		}
	}, [enabled, giveawayId]);

	useEffect(() => { load().catch(() => undefined); }, [load]);

	return { data, loading, error, reload: load };
}