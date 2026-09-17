import { Router } from "express";
import { getMyClaim, getMyStatus, submitClaim, updateStatus } from "../controllers/claimController.js";
import { requireAdminUser, requireAuthenticatedUser } from "../middleware/authMiddleware.js";
import { claimRateLimiter } from "../middleware/rateLimitMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";
import { validateClaimRequest, validateClaimStatusRequest } from "../validators/claimValidator.js";

const router = Router();

router.get("/giveaways/:giveawayId/claim", requireAuthenticatedUser, getMyClaim);
router.get("/giveaways/:giveawayId/my-status", requireAuthenticatedUser, getMyStatus);
router.post(
	"/giveaways/:giveawayId/claim",
	requireAuthenticatedUser,
	claimRateLimiter,
	validateClaimRequest,
	validateRequest,
	submitClaim,
);
router.patch(
	"/giveaways/:giveawayId/claims/:claimId/status",
	requireAuthenticatedUser,
	requireAdminUser,
	validateClaimStatusRequest,
	validateRequest,
	updateStatus,
);

export default router;
