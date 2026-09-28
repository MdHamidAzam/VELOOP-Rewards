import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import app from "../app.js";

const managementRequests = [
	["POST", "/api/giveaways", { id: "AUDIT-NO-WRITE", title: "Audit", slug: "audit", description: "Audit", status: "ACTIVE", startAt: "2026-01-01", endAt: "2027-01-01" }],
	["PATCH", "/api/giveaways/GW-2026-09", { status: "ENDED" }],
	["POST", "/api/giveaways/GW-2026-09/prizes", { name: "Audit", position: 99, winnerCount: 1, prizeType: "DIGITAL", claimType: "DIGITAL", entryCurrency: "VES", entryAmount: 1 }],
	["PATCH", "/api/giveaways/GW-2026-09/prizes/PRIZE-IPHONE-15-PRO", { entryAmount: 1 }],
];

let server;
let baseUrl;

before(async () => {
	server = app.listen(0, "127.0.0.1");
	await new Promise((resolve, reject) => {
		server.once("listening", resolve);
		server.once("error", reject);
	});
	baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
	if (server?.listening) await new Promise((resolve) => server.close(resolve));
});

for (const [method, path, body] of managementRequests) {
	test(`${method} ${path} rejects anonymous and non-admin callers`, async () => {
		for (const caller of [
			{ name: "anonymous", headers: {} },
			{ name: "non-admin", headers: { Authorization: `Bearer demo-token:AUDIT-NON-ADMIN-${randomUUID()}` } },
		]) {
			const response = await fetch(`${baseUrl}${path}`, {
				method,
				headers: { "Content-Type": "application/json", ...caller.headers },
				body: JSON.stringify(body),
			});
			assert.equal(response.status, caller.name === "anonymous" ? 401 : 403, `${caller.name} was not rejected`);
		}
	});
}