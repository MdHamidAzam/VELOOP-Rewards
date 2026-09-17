import { Router } from "express";
import { devLogin } from "../controllers/authController.js";

const router = Router();

router.post("/dev-login", devLogin);

export default router;