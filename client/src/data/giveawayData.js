import { PRIZES } from "./prizeData.js";

// Development-only giveaway records shaped like API responses.
export const GIVEAWAY_STATUS = Object.freeze({
	UPCOMING: "UPCOMING",
	ACTIVE: "ACTIVE",
	ENDED: "ENDED",
	ARCHIVED: "ARCHIVED",
});

export const giveawayStats = Object.freeze({
	totalGiveaways: 24,
	participants: "8,500+",
	prizesWon: "1,200+",
});

export const CURRENT_GIVEAWAY = Object.freeze({
	id: "GW-2026-09",
	title: "September 2026 Giveaway",
	slug: "september-2026-giveaway",
	status: GIVEAWAY_STATUS.ACTIVE,
	startDate: "2026-09-01T00:00:00.000Z",
	endDate: "2026-09-30T23:59:59.000Z",
	description: "Development giveaway record for the September 2026 event.",
	participants: 1842,
	prizes: PRIZES,
});

export const PREVIOUS_GIVEAWAYS = Object.freeze([
	Object.freeze({
		id: "GW-2026-08",
		title: "August 2026 Giveaway",
		slug: "august-2026-giveaway",
		status: GIVEAWAY_STATUS.ENDED,
		startDate: "2026-08-01T00:00:00.000Z",
		endDate: "2026-08-31T23:59:59.000Z",
		description: "Completed development giveaway record for August 2026.",
		participants: 1620,
		prizes: PRIZES,
	}),
]);

export const GIVEAWAYS = Object.freeze([
	CURRENT_GIVEAWAY,
	...PREVIOUS_GIVEAWAYS,
]);
