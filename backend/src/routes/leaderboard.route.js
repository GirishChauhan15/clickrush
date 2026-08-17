import { Router } from "express";
import { leaderboard, myRank } from "../controllers/leaderboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", leaderboard);
router.get("/me", requireAuth, myRank);

export default router;
