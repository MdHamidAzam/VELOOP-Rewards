import { GIVEAWAY_STATUS } from "../data/giveawayData.js";
import { PRIZES } from "../data/prizeData.js";

export const DEMO_MODE = import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL;
export const DEMO_USERS = Object.freeze([
	...(import.meta.env.DEV ? [{ id: "DEV-USER-1002", label: "Winner E2E - DEV-USER-1002" }] : []),
	{ id: "VE10025", label: "Winner - VE10025" },
	{ id: "VE10028", label: "Gift-card winner - VE10028" },
	{ id: "VE10026", label: "Non-winner - VE10026" },
	{ id: "VE10027", label: "New participant - VE10027" },
]);

const DEMO_PARTICIPATIONS_KEY = "veloop.demo.participations";
const DEMO_CLAIMS_KEY = "veloop.demo.claims";

const activeGiveaway = {
	id: "GW-2026-09",
	title: "September 2026 Giveaway",
	slug: "september-2026-giveaway",
	status: GIVEAWAY_STATUS.ACTIVE,
	startAt: "2026-09-01T00:00:00.000Z",
	endAt: "2026-09-30T23:59:59.000Z",
	description: "Development demo giveaway record for the September 2026 event.",
	rules: ["One participation per user and giveaway.", "The configured entry fee is deducted by the backend in production."],
	eligibility: { minAge: 18, countries: [], requiresVerifiedUser: false },
	participationSettings: { maxParticipationsPerUser: 1 },
	prizes: PRIZES.map((prize) => ({ ...prize, status: "AVAILABLE" })),
	participantCount: 1842,
	statistics: { totalGiveaways: 24, participants: 1842, prizesWon: 1200 },
	winners: [],
};

const archivedGiveaway = {
	id: "GW-2026-08",
	title: "August 2026 Giveaway",
	slug: "august-2026-giveaway",
	status: GIVEAWAY_STATUS.ENDED,
	startAt: "2026-08-01T00:00:00.000Z",
	endAt: "2026-08-31T23:59:59.000Z",
	winnersFinalizedAt: "2026-08-31T23:59:59.000Z",
	description: "Completed development demo giveaway record for August 2026.",
	rules: activeGiveaway.rules,
	eligibility: activeGiveaway.eligibility,
	participationSettings: activeGiveaway.participationSettings,
	prizes: PRIZES.map((prize) => ({ ...prize, id: `${prize.id}-GW-2026-08`, status: "AWARDED" })),
	participantCount: 1620,
	statistics: { totalGiveaways: 24, participants: 1620, prizesWon: 1 },
	winners: [{
		id: "demo-winner-aug-watch",
		prizeId: "PRIZE-APPLE-WATCH-GW-2026-08",
		prizeName: "Apple Watch",
		prizeImage: PRIZES[1].image,
		maskedId: "VE****25",
		status: "SELECTED",
		selectedAt: "2026-08-31T23:59:59.000Z",
	}, {
		id: "demo-winner-aug-gift-card",
		prizeId: "PRIZE-AMAZON-2000-GW-2026-08",
		prizeName: "₹2,000 Amazon Gift Card",
		prizeImage: PRIZES[3].image,
		maskedId: "VE****28",
		status: "SELECTED",
		selectedAt: "2026-08-31T23:59:59.000Z",
	}],
};


const winnerE2EGiveaway = import.meta.env.DEV ? {
	id: "GW-2026-WINNER-E2E",
	title: "Winner Finalization E2E Fixture",
	slug: "winner-finalization-e2e-fixture",
	status: GIVEAWAY_STATUS.ENDED,
	startAt: "2026-09-01T00:00:00.000Z",
	endAt: "2026-09-20T23:59:59.000Z",
	winnersFinalizedAt: "2026-09-25T00:00:00.000Z",
	description: "Development-only fixture for winner claim E2E testing.",
	rules: ["Development-only winner claim test fixture."],
	eligibility: { minAge: 18, countries: [], requiresVerifiedUser: false },
	participationSettings: { maxParticipationsPerUser: 1, entryCurrency: "SVES", entryAmount: 1 },
	prizes: [{
		id: "PRIZE-WINNER-E2E",
		name: "Winner Finalization E2E Prize",
		position: 1,
		image: null,
		description: "Development-only digital prize for winner claim E2E testing.",
		winnerCount: 1,
		prizeType: "DIGITAL",
		claimType: "DIGITAL",
		entryFee: { amount: 1, currency: "SVES" },
		status: "AWARDED",
	}],
	participantCount: 1,
	statistics: { totalGiveaways: 25, participants: 1, prizesWon: 1 },
	winners: [{
		id: "demo-winner-e2e-1002",
		prizeId: "PRIZE-WINNER-E2E",
		prizeName: "Winner Finalization E2E Prize",
		prizeImage: null,
		maskedId: "DE****02",
		status: "SELECTED",
		selectedAt: "2026-09-25T00:00:00.000Z",
	}],
} : null;

const upcomingGiveaway = {
	id: "GW-2026-10",
	title: "October 2026 Giveaway",
	slug: "october-2026-giveaway",
	status: GIVEAWAY_STATUS.UPCOMING,
	startAt: "2026-10-15T00:00:00.000Z",
	endAt: "2026-11-15T23:59:59.000Z",
	description: "Upcoming development demo giveaway record for the October 2026 event.",
	rules: activeGiveaway.rules,
	eligibility: activeGiveaway.eligibility,
	participationSettings: activeGiveaway.participationSettings,
	prizes: PRIZES.map((prize) => ({ ...prize, id: `${prize.id}-GW-2026-10`, status: "UPCOMING" })),
	participantCount: 0,
	statistics: { totalGiveaways: 25, participants: 0, prizesWon: 1200 },
	winners: [],
};

const DEMO_WINNER_RECORDS = Object.freeze([
	{ giveawayId: archivedGiveaway.id, userId: "VE10025", winner: archivedGiveaway.winners[0], claimType: "PHYSICAL" },
	{ giveawayId: archivedGiveaway.id, userId: "VE10028", winner: archivedGiveaway.winners[1], claimType: "EMAIL" },
	...(import.meta.env.DEV && winnerE2EGiveaway ? [{ giveawayId: winnerE2EGiveaway.id, userId: "DEV-USER-1002", winner: winnerE2EGiveaway.winners[0], claimType: "DIGITAL" }] : []),
]);

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

function readJson(key, fallback) {
	try { return JSON.parse(window.sessionStorage.getItem(key) ?? JSON.stringify(fallback)); } catch { return fallback; }
}

function writeJson(key, value) {
	try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Demo state is best effort. */ }
}

export function getDemoUserId() {
	const token = window.sessionStorage.getItem("veloop.accessToken") ?? "";
	return token.startsWith("demo-token:") ? token.slice("demo-token:".length) : null;
}

export function getDemoGiveaway(giveawayId) {
	if (giveawayId === activeGiveaway.id) return clone(activeGiveaway);
	if (giveawayId === archivedGiveaway.id) return clone(archivedGiveaway);
	if (import.meta.env.DEV && winnerE2EGiveaway && giveawayId === winnerE2EGiveaway.id) return clone(winnerE2EGiveaway);
	if (giveawayId === upcomingGiveaway.id) return clone(upcomingGiveaway);
	return null;
}

export function getDemoCurrentGiveaway() { return clone(activeGiveaway); }
export function getDemoPreviousGiveaways() { return [clone(archivedGiveaway)]; }
export function getDemoPreviousWinners() {
	return [{
		giveaway: {
			id: archivedGiveaway.id,
			title: archivedGiveaway.title,
			status: archivedGiveaway.status,
			endAt: archivedGiveaway.endAt,
			winnersFinalizedAt: archivedGiveaway.winnersFinalizedAt,
		},
		winners: clone(archivedGiveaway.winners),
	}];
}

export function getDemoWallet(currency = "VES") {
	const balances = { VE10025: 850, VE10026: 850, VE10027: 850 };
	const normalizedCurrency = String(currency).toUpperCase();
	const currencyBalances = { VES: balances[getDemoUserId()] ?? 850, SVES: 900, TOKENS: 5000 };
	return { userId: getDemoUserId(), currency: normalizedCurrency, balance: currencyBalances[normalizedCurrency] ?? 850 };
}

export function getDemoStatus(giveawayId) {
	const userId = getDemoUserId();
	const participations = readJson(DEMO_PARTICIPATIONS_KEY, {});
	const claims = readJson(DEMO_CLAIMS_KEY, {});
	const participationKey = `${userId}:${giveawayId}`;
	const winnerRecord = DEMO_WINNER_RECORDS.find((record) => record.giveawayId === giveawayId && record.userId === userId);
	const winner = winnerRecord ? {
		...clone(winnerRecord.winner),
		claimType: winnerRecord.claimType,
		claimDeadline: new Date(new Date(winnerRecord.winner.selectedAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
	} : null;
	return {
		giveawayId,
		participating: Boolean(participations[participationKey]) || Boolean(winner),
		entries: participations[participationKey] ? 1 : winner ? 1 : 0,
		winner,
		claim: claims[participationKey] ?? null,
	};
}

export function joinDemoGiveaway(giveawayId, prizeId) {
	const userId = getDemoUserId();
	const key = `${userId}:${giveawayId}`;
	const participations = readJson(DEMO_PARTICIPATIONS_KEY, {});
	if (participations[key]) return { giveawayId, prizeId, entryId: `demo-entry-${key}`, transactionId: `demo-transaction-${key}`, idempotent: true };
	participations[key] = { prizeId, createdAt: new Date().toISOString() };
	writeJson(DEMO_PARTICIPATIONS_KEY, participations);
	return { giveawayId, prizeId, entryId: `demo-entry-${key}`, transactionId: `demo-transaction-${key}` };
}

export function submitDemoClaim(giveawayId, claimData) {
	const userId = getDemoUserId();
	const status = getDemoStatus(giveawayId);
	if (!status.winner) throw new Error("Only a verified winner can claim this prize.");
	const key = `${userId}:${giveawayId}`;
	const claims = readJson(DEMO_CLAIMS_KEY, {});
	if (claims[key]) throw new Error("A claim has already been submitted for this prize.");
	const claim = { id: `demo-claim-${key}`, giveawayId, prizeId: status.winner.prizeId, claimType: status.winner.claimType, status: "SUBMITTED", submittedAt: new Date().toISOString(), expiresAt: status.winner.claimDeadline, claimData };
	claims[key] = claim;
	writeJson(DEMO_CLAIMS_KEY, claims);
	return claim;
}

export function isDemoFallbackError(error) {
	return DEMO_MODE && (error?.code === "NETWORK_ERROR" || error?.status === 404 || error?.status >= 500 || error?.code === "INVALID_RESPONSE");
}

export function getDemoClaim(giveawayId) {
	const userId = getDemoUserId();
	return readJson(DEMO_CLAIMS_KEY, {})[`${userId}:${giveawayId}`] ?? null;
}