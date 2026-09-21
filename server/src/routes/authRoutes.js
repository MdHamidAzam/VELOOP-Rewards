import { Router } from "express";
import { devLogin, login, register } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/dev-login", devLogin);

export default router;