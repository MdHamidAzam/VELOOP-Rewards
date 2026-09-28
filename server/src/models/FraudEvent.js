import mongoose from "mongoose";

const { Schema } = mongoose;

const fraudEventSchema = new Schema(
	{
		userId: { type: String, trim: true },
		giveawayId: { type: Schema.Types.ObjectId, ref: "Giveaway" },
		deviceHash: { type: String, trim: true, select: false },
		networkHash: { type: String, trim: true, select: false },
		event: { type: String, required: true, trim: true, uppercase: true },
		risk: {
		level: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
		 score: { type: Number, min: 0, max: 100 },
		},
		action: { type: String, enum: ["ALLOWED", "FLAGGED", "BLOCKED"] },
		reason: { type: String, trim: true },
		metadata: { type: Schema.Types.Mixed },
		status: { type: String, required: true, enum: ["OPEN", "REVIEWED", "RESOLVED", "IGNORED"], default: "OPEN" },
	},
	{ timestamps: true },
);

fraudEventSchema.index({ giveawayId: 1, userId: 1, createdAt: -1 });
fraudEventSchema.index({ deviceHash: 1, createdAt: -1 }, { sparse: true });
fraudEventSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.FraudEvent || mongoose.model("FraudEvent", fraudEventSchema);
