import mongoose from "mongoose";

const { Schema } = mongoose;

const giveawayWinnerSchema = new Schema(
	{
		userId: { type: String, required: true, trim: true },
		giveawayId: { type: Schema.Types.ObjectId, ref: "Giveaway", required: true },
		prizeId: { type: Schema.Types.ObjectId, ref: "Prize", required: true },
		status: { type: String, required: true, enum: ["SELECTED", "CLAIMED", "DECLINED", "EXPIRED"], default: "SELECTED" },
		selectionMethod: { type: String, required: true, trim: true, uppercase: true },
		selectedAt: { type: Date, required: true, default: Date.now },
		maskedId: { type: String, trim: true },
		claimId: { type: Schema.Types.ObjectId, ref: "PrizeClaim" },
	},
	{ timestamps: true },
);

giveawayWinnerSchema.index({ giveawayId: 1, selectedAt: -1 });
giveawayWinnerSchema.index({ giveawayId: 1, prizeId: 1 });
giveawayWinnerSchema.index({ userId: 1, giveawayId: 1 });
giveawayWinnerSchema.index({ giveawayId: 1, prizeId: 1, userId: 1 }, { unique: true });

export default mongoose.models.GiveawayWinner || mongoose.model("GiveawayWinner", giveawayWinnerSchema);
