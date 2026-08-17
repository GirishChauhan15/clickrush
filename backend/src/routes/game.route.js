import { Router } from "express";
import { history, stats, submitGame } from "../controllers/game.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { gameLimiter } from "../middleware/rateLimiters.middleware.js";

const router = Router();
router.use(requireAuth);

router.post("/submit", gameLimiter, submitGame);
router.get("/history", history);
router.get("/stats", stats);

export default router;
