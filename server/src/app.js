import express from "express";
import participationRoutes from "./routes/participationRoutes.js";

const app = express();

app.use(express.json());
app.use("/api", participationRoutes);

export default app;
