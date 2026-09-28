export const PARTICIPATION_RISK_POLICY = Object.freeze({
	LOW: "ALLOW",
	MEDIUM: "REVIEW",
	HIGH: "BLOCK",
	CRITICAL: "BLOCK",
});

export function assessParticipationRisk({
	sameDeviceMatch = false,
	repeatedFailedAttempts = false,
	multipleAccountSignals = false,
} = {}) {
	const score = Math.min(100,
		(sameDeviceMatch ? 45 : 0)
		+ (repeatedFailedAttempts ? 30 : 0)
		+ (multipleAccountSignals ? 35 : 0),
	);
	const level = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";
	return { score, level, action: PARTICIPATION_RISK_POLICY[level] };
}