import { Router } from "express";
import {
	getCurrentGiveawayController,
	getGiveawayController,
	getBrowseGiveawaysController,
	getPreviousGiveawaysController,
} from "../controllers/giveawayController.js";
import { createGiveaway, createGiveawayPrize, updateGiveaway, updateGiveawayPrize } from "../controllers/adminGiveawayController.js";
import { requireAdminUser, requireAuthenticatedUser } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";
import { validateCreateGiveaway, validateCreatePrize, validateUpdateGiveaway, validateUpdatePrize } from "../validators/giveawayValidator.js";

const router = Router();

router.get("/current", getCurrentGiveawayController);
router.get("/previous", getPreviousGiveawaysController);
router.get("/browse", getBrowseGiveawaysController);
router.post("/", requireAuthenticatedUser, requireAdminUser, validateCreateGiveaway, validateRequest, createGiveaway);
router.patch("/:giveawayId", requireAuthenticatedUser, requireAdminUser, validateUpdateGiveaway, validateRequest, updateGiveaway);
router.post("/:giveawayId/prizes", requireAuthenticatedUser, requireAdminUser, validateCreatePrize, validateRequest, createGiveawayPrize);
router.patch("/:giveawayId/prizes/:prizeId", requireAuthenticatedUser, requireAdminUser, validateUpdatePrize, validateRequest, updateGiveawayPrize);
router.get("/:giveawayId", getGiveawayController);

export default router;
