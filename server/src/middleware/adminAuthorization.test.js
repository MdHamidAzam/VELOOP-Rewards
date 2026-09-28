import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { requireAdminUser, requireAuthenticatedUser } from "./authMiddleware.js";

function mockResponse() {
	return {
		statusCode: null,
		payload: null,
		status(code) { this.statusCode = code; return this; },
		json(payload) { this.payload = payload; return this; },
	};
}

test("authentication middleware rejects an anonymous admin request", async () => {
	const response = mockResponse();
	const request = { get: () => undefined };
	await requireAuthenticatedUser(request, response, () => assert.fail("anonymous request must not continue"));
	assert.equal(response.statusCode, 401);
});

test("admin middleware rejects an authenticated non-admin identity", () => {
	const response = mockResponse();
	const request = { user: { userId: `AUDIT-NON-ADMIN-${randomUUID()}` } };
	let continued = false;
	requireAdminUser(request, response, () => { continued = true; });
	assert.equal(continued, false);
	assert.equal(response.statusCode, 403);
});