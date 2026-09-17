import mongoose from "mongoose";

const { Schema } = mongoose;

const giveawayParticipationSchema = new Schema(
	{
		userId: { type: String, required: true, trim: true },
		giveawayId: { type: Schema.Types.ObjectId, ref: "Giveaway", required: true },
		prizeId: { type: Schema.Types.ObjectId, ref: "Prize", required: true },
		entryCurrency: { type: String, required: true, trim: true, uppercase: true },
		entryAmount: { type: Number, required: true, min: 0 },
		deviceHash: { type: String, trim: true, select: false },
		status: {
			type: String,
			required: true,
			enum: ["ACTIVE", "COMPLETED", "CANCELLED", "REJECTED"],
			default: "ACTIVE",
		},
		joinedAt: { type: Date, required: true, default: Date.now },
		transactionId: { type: String, trim: true },
		idempotencyKey: { type: String, trim: true, select: false },
	},
	{ timestamps: true },
);

giveawayParticipationSchema.index({ userId: 1, giveawayId: 1 }, { unique: true });
giveawayParticipationSchema.index({ giveawayId: 1, status: 1 });
giveawayParticipationSchema.index({ userId: 1, giveawayId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

export default mongoose.models.GiveawayParticipation || mongoose.model("GiveawayParticipation", giveawayParticipationSchema);
