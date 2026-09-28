import assert from "node:assert/strict";
import test from "node:test";
import { E2E_WINNER_FIXTURE_ID, publicGiveawayQuery } from "./giveawayVisibility.js";

test("production public query excludes tagged and legacy E2E fixture records", () => {
	const filter = publicGiveawayQuery({ status: "ENDED" }, "production");
	assert.deepEqual(filter.$and[0], { status: "ENDED" });
	assert.deepEqual(filter.$and[1], { isTestFixture: { $ne: true } });
	assert.deepEqual(filter.$and[2], { id: { $nin: [E2E_WINNER_FIXTURE_ID] } });
});

test("development public query leaves the local fixture available", () => {
	const query = { id: E2E_WINNER_FIXTURE_ID };
	assert.equal(publicGiveawayQuery(query, "development"), query);
});