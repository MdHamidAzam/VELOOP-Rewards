import mongoose from "mongoose";

const { Schema } = mongoose;

const giveawayEntryTransactionSchema = new Schema(
	{
		userId: { type: String, required: true, trim: true },
		giveawayId: { type: Schema.Types.ObjectId, ref: "Giveaway", required: true },
		prizeId: { type: Schema.Types.ObjectId, ref: "Prize", required: true },
		currency: { type: String, required: true, trim: true, uppercase: true },
		amount: { type: Number, required: true, min: 0 },
		type: { type: String, required: true, enum: ["ENTRY_DEDUCTION", "REVERSAL", "COMPENSATION"] },
		status: { type: String, required: true, enum: ["PENDING", "SUCCESS", "FAILED", "REVERSED"], default: "PENDING" },
		balanceBefore: { type: Number, min: 0 },
		balanceAfter: { type: Number, min: 0 },
		transactionId: { type: String, required: true, trim: true, unique: true },
		reversalOf: { type: Schema.Types.ObjectId, ref: "GiveawayEntryTransaction" },
	},
	{ timestamps: true },
);

giveawayEntryTransactionSchema.index({ userId: 1, giveawayId: 1 });
giveawayEntryTransactionSchema.index({ giveawayId: 1, createdAt: -1 });

export default mongoose.models.GiveawayEntryTransaction || mongoose.model("GiveawayEntryTransaction", giveawayEntryTransactionSchema);
