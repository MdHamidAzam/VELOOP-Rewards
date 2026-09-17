import mongoose from "mongoose";

const { Schema } = mongoose;

const walletSchema = new Schema(
	{
		userId: { type: String, required: true, trim: true },
		currency: { type: String, required: true, enum: ["VES", "SVES", "TOKENS"] },
		balance: { type: Number, required: true, min: 0, default: 0 },
		status: { type: String, required: true, enum: ["ACTIVE", "SUSPENDED", "CLOSED"], default: "ACTIVE" },
	},
	{ timestamps: true },
);

walletSchema.index({ userId: 1, currency: 1 }, { unique: true });
walletSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
