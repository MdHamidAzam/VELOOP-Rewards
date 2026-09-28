import assert from "node:assert/strict";
import test from "node:test";
import { validationResult } from "express-validator";
import { validateCreateGiveaway, validateCreatePrize, validateUpdatePrize } from "./giveawayValidator.js";

async function errorsFor(chains, body, params = {}) {
	const request = { body, params };
	await Promise.all(chains.map((chain) => chain.run(request)));
	return validationResult(request).array();
}

const validGiveaway = {
	id: "GW-ADMIN-TEST",
	title: "Admin test giveaway",
	slug: "admin-test-giveaway",
	description: "Validated test fixture.",
	status: "UPCOMING",
	startAt: "2026-10-01T00:00:00.000Z",
	endAt: "2026-11-01T00:00:00.000Z",
	participationSettings: { maxParticipationsPerUser: 1 },
};

const validPrize = {
	name: "Digital prize",
	position: 1,
	winnerCount: 1,
	prizeType: "DIGITAL",
	claimType: "EMAIL",
	entryCurrency: "TOKENS",
	entryAmount: 2000,
};

test("accepts allow-listed giveaway and prize configuration", async () => {
	assert.deepEqual(await errorsFor(validateCreateGiveaway, validGiveaway), []);
	assert.deepEqual(await errorsFor(validateCreatePrize, validPrize, { giveawayId: "GW-ADMIN-TEST" }), []);
});

test("rejects client financial and identity fields from giveaway configuration", async () => {
	const errors = await errorsFor(validateCreateGiveaway, { ...validGiveaway, userId: "attacker", balance: 9999 });
	assert.ok(errors.length > 0);
});

test("rejects invalid giveaway date order", async () => {
	const errors = await errorsFor(validateCreateGiveaway, { ...validGiveaway, startAt: "2026-12-01T00:00:00.000Z" });
	assert.ok(errors.length > 0);
});

test("prevents prize identifier changes through the update endpoint", async () => {
	const errors = await errorsFor(validateUpdatePrize, { id: "REPLACEMENT-ID", entryAmount: 10 }, { giveawayId: "GW-ADMIN-TEST", prizeId: "PRIZE-ORIGINAL" });
	assert.ok(errors.length > 0);
});