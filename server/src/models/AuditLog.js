import mongoose from "mongoose";

const { Schema } = mongoose;

const auditLogSchema = new Schema(
	{
		actorId: { type: String, trim: true },
		action: { type: String, required: true, trim: true, uppercase: true },
		entityType: {
			type: String,
			required: true,
			enum: ["GIVEAWAY", "PRIZE", "PARTICIPATION", "TRANSACTION", "WINNER", "CLAIM", "FRAUD"],
		},
		entityId: { type: String, required: true, trim: true },
		giveawayId: { type: Schema.Types.ObjectId, ref: "Giveaway" },
		metadata: { type: Schema.Types.Mixed },
		requestId: { type: String, trim: true },
	},
	{ timestamps: true },
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ giveawayId: 1, action: 1, createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
