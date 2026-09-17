import { ApiError, apiRequest } from "./api.js";
import { DEMO_MODE, getDemoCurrentGiveaway, getDemoGiveaway, getDemoPreviousGiveaways, getDemoPreviousWinners, isDemoFallbackError } from "./demoData.js";

function unwrapData(payload) {
	if (!payload?.success || payload.data === undefined) {
		throw new ApiError("The giveaway API returned an invalid response.", {
			code: "INVALID_RESPONSE",
		});
	}

	return payload.data;
}

/**
 * @typedef {Object} GiveawayApiRecord
 * @property {string} id
 * @property {string} title
 * @property {string} [slug]
 * @property {string} description
 * @property {string} status
 * @property {string} startAt
 * @property {string} endAt
 * @property {string[]} rules
 * @property {Object} eligibility
 * @property {Object} participationSettings
 * @property {Array<Object>} prizes
 * @property {number} participantCount
 * @property {Array<Object>} [winners]
 */

export async function getCurrentGiveaway(options) {
	if (DEMO_MODE) return getDemoCurrentGiveaway();
	try { return unwrapData(await apiRequest("giveaways/current", options)); } catch (error) { if (isDemoFallbackError(error)) return getDemoCurrentGiveaway(); throw error; }
}

export async function getGiveawayById(giveawayId, options) {
	if (!giveawayId) throw new TypeError("giveawayId is required.");
	if (DEMO_MODE) { const giveaway = getDemoGiveaway(giveawayId); if (giveaway) return giveaway; }

	try { return unwrapData(await apiRequest(`giveaways/${encodeURIComponent(giveawayId)}`, options)); } catch (error) { if (isDemoFallbackError(error)) { const giveaway = getDemoGiveaway(giveawayId); if (giveaway) return giveaway; } throw error; }
}

export async function getPreviousGiveaways(options) {
	if (DEMO_MODE) return getDemoPreviousGiveaways();
	let data;
	try { data = unwrapData(await apiRequest("giveaways/previous", options)); } catch (error) { if (isDemoFallbackError(error)) return getDemoPreviousGiveaways(); throw error; }
	if (!Array.isArray(data)) {
		throw new ApiError("The giveaway history API returned an invalid response.", {
			code: "INVALID_RESPONSE",
		});
	}

	return data;
}

export async function getPreviousWinners(options) {
	if (DEMO_MODE) return getDemoPreviousWinners();
	let data;
	try { data = unwrapData(await apiRequest("giveaways/previous/winners", options)); } catch (error) { if (isDemoFallbackError(error)) return getDemoPreviousWinners(); throw error; }
	if (!Array.isArray(data)) {
		throw new ApiError("The previous winners API returned an invalid response.", {
			code: "INVALID_RESPONSE",
		});
	}

	return data;
}

export async function getGiveawayWinners(giveawayId, options) {
	if (!giveawayId) throw new TypeError("giveawayId is required.");
	return unwrapData(await apiRequest(`giveaways/${encodeURIComponent(giveawayId)}/winners`, options));
}