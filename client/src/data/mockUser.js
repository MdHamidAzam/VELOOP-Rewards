// Development-only mock user data. Authentication is intentionally not implemented.
export const MOCK_USER = Object.freeze({
	id: "VE10025",
	isLoggedIn: true,
	balances: Object.freeze({
		VEs: 350,
		SVEs: 600,
		Tokens: 2500,
	}),
	participation: Object.freeze({
		activeGiveawayIds: ["GW-2026-09"],
		enteredGiveawayIds: ["GW-2026-09"],
		entryCountByGiveaway: Object.freeze({
			"GW-2026-09": 4,
		}),
	}),
});
