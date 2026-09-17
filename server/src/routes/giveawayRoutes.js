import { Router } from "express";
import {
	getCurrentGiveawayController,
	getGiveawayController,
	getPreviousGiveawaysController,
} from "../controllers/giveawayController.js";

const router = Router();

router.get("/current", getCurrentGiveawayController);
router.get("/previous", getPreviousGiveawaysController);
router.get("/:giveawayId", getGiveawayController);

export default router;
