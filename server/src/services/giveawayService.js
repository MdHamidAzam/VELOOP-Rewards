import Giveaway from "../models/Giveaway.js";
import GiveawayParticipation from "../models/GiveawayParticipation.js";
import GiveawayWinner from "../models/GiveawayWinner.js";
import Prize from "../models/Prize.js";

const HISTORICAL_STATUSES = ["ENDED", "ARCHIVED"];

async function synchronizeLifecycle() {
	const now = new Date();
	await Giveaway.updateMany(
		{ status: "UPCOMING", startAt: { $lte: now }, endAt: { $gte: now } },
		{ $set: { status: "ACTIVE" } },
	);
	await Giveaway.updateMany(
		{ status: "ACTIVE", endAt: { $lt: now } },
		{ $set: { status: "ENDED" } },
	);
}

function serializePrize(prize) {
	return {
		id: prize.id,
		name: prize.name,
		position: prize.position,
		image: prize.image ?? null,
		description: prize.description ?? null,
		winnerCount: prize.winnerCount,
		prizeType: prize.prizeType,
		claimType: prize.claimType,
		entryFee: {
			amount: prize.entryAmount,
			currency: prize.entryCurrency,
		},
		status: prize.status,
	};
}

function serializeWinner(winner, prizeById) {
	return {
		id: winner._id.toString(),
		prizeId: prizeById.get(winner.prizeId.toString())?.id ?? winner.prizeId.toString(),
		prizeName: prizeById.get(winner.prizeId.toString())?.name ?? null,
		prizeImage: prizeById.get(winner.prizeId.toString())?.image ?? null,
		maskedId: winner.maskedId ?? winner.userId,
		status: winner.status,
		selectedAt: winner.selectedAt,
	};
}

async function serializeGiveaway(giveaway) {
	const shouldExposeWinners = HISTORICAL_STATUSES.includes(giveaway.status)
		&& giveaway.winnersFinalizedAt != null;
	const [prizes, participantCount, winners, totalGiveaways, prizesWon] = await Promise.all([
		Prize.find({ giveawayId: giveaway._id }).sort({ position: 1 }).lean(),
		GiveawayParticipation.countDocuments({ giveawayId: giveaway._id }),
		shouldExposeWinners
			? GiveawayWinner.find({ giveawayId: giveaway._id }).sort({ selectedAt: -1 }).lean()
			: [],
		Giveaway.countDocuments(),
		GiveawayWinner.countDocuments({ status: { $in: ["SELECTED", "CLAIMED"] } }),
	]);
	const serializedPrizes = prizes.map(serializePrize);
	const prizeById = new Map(prizes.map((prize) => [prize._id.toString(), prize]));
	const participationSettings = giveaway.participationSettings ?? {};

	return {
		id: giveaway.id,
		title: giveaway.title,
		slug: giveaway.slug,
		description: giveaway.description,
		status: giveaway.status,
		startAt: giveaway.startAt,
		endAt: giveaway.endAt,
		winnersFinalizedAt: giveaway.winnersFinalizedAt ?? null,
		rules: giveaway.rules,
		eligibility: giveaway.eligibility,
		participationSettings,
		entryFee: participationSettings.entryAmount == null
			? null
			: { amount: participationSettings.entryAmount, currency: participationSettings.entryCurrency },
		prizes: serializedPrizes,
		participantCount,
		statistics: { totalGiveaways, participants: participantCount, prizesWon },
		winners: winners.map((winner) => serializeWinner(winner, prizeById)),
	};
}

export async function getCurrentGiveaway() {
	await synchronizeLifecycle();
	const giveaway = await Giveaway.findOne({ status: "ACTIVE" }).sort({ startAt: -1 }).lean();
	return giveaway ? serializeGiveaway(giveaway) : null;
}

export async function getGiveawayById(giveawayId) {
	await synchronizeLifecycle();
	const giveaway = await Giveaway.findOne({ id: giveawayId }).lean();
	return giveaway ? serializeGiveaway(giveaway) : null;
}

export async function getPreviousGiveaways() {
	await synchronizeLifecycle();
	const giveaways = await Giveaway.find({ status: { $in: HISTORICAL_STATUSES } })
		.sort({ endAt: -1 })
		.lean();
	return Promise.all(giveaways.map(serializeGiveaway));
}
