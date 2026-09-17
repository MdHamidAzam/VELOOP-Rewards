import { Router } from "express";
import {
	finalizeGiveawayController,
	getGiveawayWinnersController,
	getPreviousWinnersController,
} from "../controllers/winnerController.js";
import { requireAdminUser, requireAuthenticatedUser } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/previous/winners", getPreviousWinnersController);
router.get("/:giveawayId/winners", getGiveawayWinnersController);
router.post(
	"/:giveawayId/finalize-winners",
	requireAuthenticatedUser,
	requireAdminUser,
	finalizeGiveawayController,
);

export default router;// Backend implementation will be added later.
