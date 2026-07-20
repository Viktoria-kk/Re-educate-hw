import { Router } from "express";
import { leaderboard } from "../controllers/leaderboard.controller.js";
const router = Router();
router.get("/", leaderboard);
export default router;
