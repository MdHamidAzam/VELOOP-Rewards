import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		userId: { type: String, required: true, trim: true, unique: true },
		email: { type: String, required: true, trim: true, lowercase: true, unique: true },
		passwordHash: { type: String, required: true, select: false },
		status: { type: String, required: true, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE" },
		role: { type: String, required: true, enum: ["USER", "ADMIN"], default: "USER" },
	},
	{ timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
