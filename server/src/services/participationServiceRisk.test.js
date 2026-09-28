import assert from "node:assert/strict";
import test from "node:test";
import { assessParticipationRisk } from "./participationRisk.js";
import { enforceParticipationRisk, ParticipationServiceError } from "./participationService.js";

test("normal low-risk participation reaches the continuation", async () => {
	let downstreamWalletCalls = 0;
	await enforceParticipationRisk({ risk: assessParticipationRisk() });
	downstreamWalletCalls += 1;
	assert.equal(downstreamWalletCalls, 1);
});

test("medium device-match review records events and stops before wallet/entry work", async () => {
	const calls = [];
	let downstreamWalletCalls = 0;
	await assert.rejects(
		enforceParticipationRisk({
			risk: assessParticipationRisk({ sameDeviceMatch: true }),
			recordFraud: async () => { calls.push("fraud"); return true; },
			recordAudit: async () => { calls.push("audit"); return true; },
		}).then(() => { downstreamWalletCalls += 1; }),
		(error) => error instanceof ParticipationServiceError && error.code === "PARTICIPATION_BLOCKED" && error.statusCode === 403,
	);
	assert.deepEqual(calls.sort(), ["audit", "fraud"]);
	assert.equal(downstreamWalletCalls, 0);
});

test("review hold fails closed if fraud/audit persistence fails", async () => {
	await assert.rejects(
		enforceParticipationRisk({
			risk: assessParticipationRisk({ sameDeviceMatch: true }),
			recordFraud: async () => true,
			recordAudit: async () => false,
		}),
		(error) => error.code === "PARTICIPATION_BLOCKED",
	);
});