import { Router } from "express";
import { requireAuthenticatedUser } from "../middleware/authMiddleware.js";
import { getWallet } from "../controllers/walletController.js";

const router = Router();

router.get("/", requireAuthenticatedUser, getWallet);

export default router;