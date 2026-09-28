export function publicWinnerId({ maskedId, userId } = {}) {
	if (typeof maskedId === "string" && maskedId.trim()) return maskedId.trim();
	if (typeof userId !== "string" || !userId.trim()) return undefined;

	const normalizedUserId = userId.trim();
	if (normalizedUserId.includes("*")) return normalizedUserId;
	if (normalizedUserId.length <= 2) return `${normalizedUserId[0] ?? "U"}****`;
	return `${normalizedUserId.slice(0, 2)}****${normalizedUserId.slice(-2)}`;
}