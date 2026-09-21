import mongoose from "mongoose";

const { Schema } = mongoose;

const claimDataSchema = new Schema(
	{
		name: { type: String, trim: true },
		phone: { type: String, trim: true },
		address: { type: String, trim: true },
		city: { type: String, trim: true },
		state: { type: String, trim: true },
		PIN: { type: String, trim: true },
		email: { type: String, trim: true, lowercase: true },
	},
	{ _id: false },
);

const prizeClaimSchema = new Schema(
	{
		userId: { type: String, required: true, trim: true },
		giveawayId: { type: Schema.Types.ObjectId, ref: "Giveaway", required: true },
		prizeId: { type: Schema.Types.ObjectId, ref: "Prize", required: true },
		winnerId: { type: Schema.Types.ObjectId, ref: "GiveawayWinner", required: true },
		claimType: { type: String, required: true, enum: ["PHYSICAL", "EMAIL", "GIFT_CARD", "DIGITAL"] },
		status: { type: String, required: true, enum: ["SUBMITTED", "PROCESSING", "COMPLETED", "EXPIRED"], default: "SUBMITTED" },
		submittedAt: { type: Date },
		processedAt: { type: Date },
		completedAt: { type: Date },
		expiresAt: { type: Date, required: true },
		claimData: { type: claimDataSchema, default: () => ({}) },
	},
	{ timestamps: true },
);

prizeClaimSchema.index({ userId: 1, giveawayId: 1 });
prizeClaimSchema.index({ giveawayId: 1, status: 1 });
prizeClaimSchema.index({ winnerId: 1 }, { unique: true });

export default mongoose.models.PrizeClaim || mongoose.model("PrizeClaim", prizeClaimSchema);
