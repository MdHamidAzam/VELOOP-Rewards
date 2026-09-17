import assert from "node:assert/strict";
import { GIVEAWAY_SEED_DATA } from "../data/giveawaySeedData.js";
import {
	buildWinnerDocuments,
	isGiveawayFinalizable,
	maskWinnerId,
	selectRandomParticipants,
} from "../services/winnerService.js";

const activeGiveaway = GIVEAWAY_SEED_DATA.find((giveaway) => giveaway.id === "GW-2026-09");
const endedGiveaway = {
	...activeGiveaway,
	status: "ENDED",
	endAt: "2026-09-16T23:59:59.000Z",
	winnersFinalizedAt: null,
};
const validationNow = new Date("2026-09-17T00:00:00.000Z");
const participants = [
	{ userId: "VE10001" },
	{ userId: "VE10002" },
	{ userId: "VE10003" },
	{ userId: "VE10004" },
];

assert.equal(isGiveawayFinalizable(activeGiveaway, validationNow), false);
assert.equal(isGiveawayFinalizable({ ...endedGiveaway, endAt: "2026-09-17T00:00:01.000Z" }, validationNow), false);
assert.equal(isGiveawayFinalizable(endedGiveaway, validationNow), true);
assert.equal(isGiveawayFinalizable({ ...endedGiveaway, winnersFinalizedAt: validationNow }, validationNow), false);

const oneWinner = selectRandomParticipants(participants, 1, () => 0);
const threeWinners = selectRandomParticipants(participants, 3, () => 0);
assert.equal(oneWinner.length, 1);
assert.equal(threeWinners.length, 3);
assert.equal(new Set(threeWinners.map((participant) => participant.userId)).size, 3);

const winnerDocuments = buildWinnerDocuments({
	participants: oneWinner,
	giveawayId: "giveaway-object-id",
	prizeId: "prize-object-id",
	selectedAt: validationNow,
});
assert.equal(winnerDocuments.length, 1);
assert.equal(winnerDocuments[0].giveawayId, "giveaway-object-id");
assert.equal(winnerDocuments[0].prizeId, "prize-object-id");
assert.equal(winnerDocuments[0].selectionMethod, "CRYPTOGRAPHIC_RANDOM");
assert.equal(winnerDocuments[0].status, "SELECTED");
assert.equal(winnerDocuments[0].selectedAt, validationNow);
assert.equal(winnerDocuments[0].maskedId, maskWinnerId(winnerDocuments[0].userId));

console.log("Winner selection validation passed.");