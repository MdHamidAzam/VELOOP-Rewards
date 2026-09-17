import { Router } from "express";
import { createParticipation } from "../controllers/participationController.js";
import { requireAuthenticatedUser } from "../middleware/authMiddleware.js";
import { participationFraudGuard } from "../middleware/fraudMiddleware.js";
import { participationRateLimiter } from "../middleware/rateLimitMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";
import { validateParticipationRequest } from "../validators/participationValidator.js";

const router = Router();

router.post(
	"/giveaways/:giveawayId/participate",
	requireAuthenticatedUser,
	participationRateLimiter,
	participationFraudGuard,
	validateParticipationRequest,
	validateRequest,
	createParticipation,
);

export default router;
