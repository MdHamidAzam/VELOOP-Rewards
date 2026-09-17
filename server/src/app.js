import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import giveawayRoutes from "./routes/giveawayRoutes.js";
import participationRoutes from "./routes/participationRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import winnerRoutes from "./routes/winnerRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl || false }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "100kb" }));
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/giveaways", giveawayRoutes);
app.use("/api/giveaways", winnerRoutes);
app.use("/api", claimRoutes);
app.use("/api", participationRoutes);
app.use(errorMiddleware);

export default app;
