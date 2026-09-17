import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
	if (!env.mongoUri) {
		throw new Error("MONGO_URI is not configured. Add it to server/.env before starting the server.");
	}

	try {
		await mongoose.connect(env.mongoUri);
		console.log("MongoDB connected");
	} catch (error) {
		throw new Error(`MongoDB connection failed: ${error.message}`, { cause: error });
	}
}
