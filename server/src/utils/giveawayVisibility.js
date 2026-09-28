import { env } from "../config/env.js";

export const E2E_WINNER_FIXTURE_ID = "GW-2026-WINNER-E2E";

const PRIVATE_FIXTURE_IDS = new Set([E2E_WINNER_FIXTURE_ID]);

export function isPrivateFixture(giveaway) {
	return Boolean(giveaway?.isTestFixture || PRIVATE_FIXTURE_IDS.has(giveaway?.id));
}

export function publicGiveawayQuery(query = {}, nodeEnv = env.nodeEnv) {
	if (nodeEnv !== "production") return query;
	return {
		$and: [
			query,
			{ isTestFixture: { $ne: true } },
			{ id: { $nin: [...PRIVATE_FIXTURE_IDS] } },
		],
	};
}