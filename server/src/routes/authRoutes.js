import { Router } from "express";
import { devLogin, login, register } from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/dev-login", devLogin);

export default router;