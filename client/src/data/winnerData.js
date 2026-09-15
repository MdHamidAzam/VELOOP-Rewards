import { APPLE_WATCH_PRIZE } from "./prizeData.js";

// Development-only winner records use masked identifiers only.
export const CLAIM_STATUS = Object.freeze({
	NOT_SUBMITTED: "NOT_SUBMITTED",
	SUBMITTED: "SUBMITTED",
	PROCESSING: "PROCESSING",
	COMPLETED: "COMPLETED",
	EXPIRED: "EXPIRED",
});

export const WINNERS = Object.freeze([
	Object.freeze({
		userId: "VE10025",
		maskedId: "VE****25",
		giveawayId: "GW-2026-09",
		prizeId: APPLE_WATCH_PRIZE.id,
		claimStatus: CLAIM_STATUS.NOT_SUBMITTED,
	}),
]);

export const WINNER_ANNOUNCEMENTS = Object.freeze([
	Object.freeze({
		giveawayId: "GW-2026-09",
		prizeId: APPLE_WATCH_PRIZE.id,
		maskedId: "VE****25",
		claimStatus: CLAIM_STATUS.NOT_SUBMITTED,
	}),
	Object.freeze({
		giveawayId: "GW-2026-08",
		prizeId: APPLE_WATCH_PRIZE.id,
		maskedId: "VE****64",
		claimStatus: CLAIM_STATUS.COMPLETED,
	}),
]);
