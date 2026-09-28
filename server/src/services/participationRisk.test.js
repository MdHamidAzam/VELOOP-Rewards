import assert from "node:assert/strict";
import test from "node:test";
import { assessParticipationRisk } from "./participationRisk.js";

test("low risk is allowed", () => {
	assert.deepEqual(assessParticipationRisk(), { score: 0, level: "LOW", action: "ALLOW" });
});

test("a device match is held for review", () => {
	assert.deepEqual(assessParticipationRisk({ sameDeviceMatch: true }), { score: 45, level: "MEDIUM", action: "REVIEW" });
});

test("combined device and repeated-failure signals are blocked as high risk", () => {
	assert.deepEqual(assessParticipationRisk({ sameDeviceMatch: true, repeatedFailedAttempts: true }), { score: 75, level: "HIGH", action: "BLOCK" });
});

test("multiple combined signals are blocked as critical risk", () => {
	assert.deepEqual(assessParticipationRisk({ sameDeviceMatch: true, repeatedFailedAttempts: true, multipleAccountSignals: true }), { score: 100, level: "CRITICAL", action: "BLOCK" });
});