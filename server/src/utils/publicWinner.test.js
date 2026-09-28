import assert from "node:assert/strict";
import test from "node:test";
import { publicWinnerId } from "./publicWinner.js";

test("preserves an explicitly supplied masked winner ID", () => {
	assert.equal(publicWinnerId({ maskedId: "VE****42", userId: "VE10042" }), "VE****42");
});

test("masks a legacy winner record when maskedId is missing", () => {
	assert.equal(publicWinnerId({ userId: "DEV-USER-1002" }), "DE****02");
});

test("does not expose an already masked legacy userId", () => {
	assert.equal(publicWinnerId({ userId: "VE****64" }), "VE****64");
});

test("omits winner identity when neither maskedId nor userId exists", () => {
	assert.equal(publicWinnerId({}), undefined);
});