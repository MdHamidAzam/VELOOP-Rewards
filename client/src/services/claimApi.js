import { ApiError, apiRequest } from "./api.js";
import { DEMO_MODE, getDemoStatus, isDemoFallbackError, submitDemoClaim } from "./demoData.js";

function unwrap(response) {
	if (!response?.success || response.data === undefined) throw new ApiError("The claim API returned an invalid response.", { code: "INVALID_RESPONSE" });
	return response.data;
}

export async function getMyGiveawayStatus(giveawayId) {
	if (DEMO_MODE) return getDemoStatus(giveawayId);
	try { return unwrap(await apiRequest(`giveaways/${encodeURIComponent(giveawayId)}/my-status`, { authenticated: true })); } catch (error) { if (isDemoFallbackError(error)) return getDemoStatus(giveawayId); throw error; }
}

export async function submitPrizeClaim(giveawayId, claimData) {
	if (DEMO_MODE) return submitDemoClaim(giveawayId, claimData);
	try {
		return unwrap(await apiRequest(`giveaways/${encodeURIComponent(giveawayId)}/claim`, { method: "POST", authenticated: true, body: JSON.stringify(claimData) }));
	} catch (error) {
		if (isDemoFallbackError(error)) return submitDemoClaim(giveawayId, claimData);
		throw error;
	}
}