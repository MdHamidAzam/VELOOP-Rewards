import mongoose from "mongoose";

const { Schema } = mongoose;

const prizeSchema = new Schema(
	{
		id: { type: String, trim: true, unique: true, sparse: true },
		giveawayId: { type: Schema.Types.ObjectId, ref: "Giveaway", required: true, index: true },
		name: { type: String, required: true, trim: true, maxlength: 200 },
		position: { type: Number, required: true, min: 1 },
		image: { type: String, trim: true },
		description: { type: String, trim: true },
		winnerCount: { type: Number, required: true, min: 1, default: 1 },
		prizeType: { type: String, required: true, enum: ["PHYSICAL", "GIFT_CARD", "DIGITAL"] },
		claimType: { type: String, required: true, enum: ["PHYSICAL", "EMAIL", "GIFT_CARD", "DIGITAL"] },
		entryCurrency: { type: String, required: true, trim: true, uppercase: true },
		entryAmount: { type: Number, required: true, min: 0 },
		status: {
			type: String,
			enum: ["AVAILABLE", "RESERVED", "AWARDED", "UNAVAILABLE"],
			default: "AVAILABLE",
		},
	},
	{ timestamps: true },
);

prizeSchema.index({ giveawayId: 1, position: 1 }, { unique: true });
prizeSchema.index({ giveawayId: 1, status: 1 });

export default mongoose.models.Prize || mongoose.model("Prize", prizeSchema);
