import mongoose from "mongoose";

const { Schema } = mongoose;

const giveawaySchema = new Schema(
	{
		id: { type: String, required: true, trim: true, unique: true },
		title: { type: String, required: true, trim: true, maxlength: 200 },
		slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
		description: { type: String, required: true, trim: true },
		status: {
			type: String,
			required: true,
			enum: ["UPCOMING", "ACTIVE", "ENDED", "ARCHIVED"],
			default: "UPCOMING",
		},
		startAt: { type: Date, required: true },
		endAt: { type: Date, required: true },
		winnersFinalizedAt: { type: Date, default: null },
		isTestFixture: { type: Boolean, required: true, default: false, select: false },
		rules: { type: [String], default: [] },
		eligibility: {
			minAge: { type: Number, min: 0 },
			countries: { type: [String], default: [] },
			requiresVerifiedUser: { type: Boolean, default: false },
		},
		prizes: [{ type: Schema.Types.ObjectId, ref: "Prize" }],
		participationSettings: {
			maxParticipationsPerUser: { type: Number, min: 1, default: 1 },
			entryCurrency: { type: String, trim: true, uppercase: true },
			entryAmount: { type: Number, min: 0 },
		},
	},
	{ timestamps: true },
);

giveawaySchema.index({ status: 1, startAt: 1, endAt: 1 });
giveawaySchema.index({ startAt: 1, endAt: 1 });

export default mongoose.models.Giveaway || mongoose.model("Giveaway", giveawaySchema);
