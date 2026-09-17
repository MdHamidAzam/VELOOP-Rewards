import { ApiError, apiRequest } from "./api.js";
import { DEMO_MODE, isDemoFallbackError, joinDemoGiveaway } from "./demoData.js";

export async function participateInGiveaway(giveawayId, prizeId) {
	if (typeof giveawayId !== "string" || !giveawayId.trim() || typeof prizeId !== "string" || !prizeId.trim()) {
		throw new ApiError("A giveaway and prize are required.", {
			code: "VALIDATION_ERROR",
			status: 400,
		});
	}
	if (DEMO_MODE) return joinDemoGiveaway(giveawayId, prizeId.trim());

	let response;
	try {
		response = await apiRequest(`giveaways/${encodeURIComponent(giveawayId)}/participate`, {
			method: "POST",
			authenticated: true,
			headers: { "X-Idempotency-Key": globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}` },
			body: JSON.stringify({ prizeId: prizeId.trim() }),
		});
	} catch (error) {
		if (isDemoFallbackError(error)) return joinDemoGiveaway(giveawayId, prizeId.trim());
		throw error;
	}

	if (!response?.success || !response.data) {
		throw new ApiError("The participation API returned an invalid response.", {
			code: "INVALID_RESPONSE",
		});
	}

	return {
		giveawayId: response.data.giveawayId,
		prizeId: response.data.prizeId,
		entryId: response.data.entryId,
	};
}
