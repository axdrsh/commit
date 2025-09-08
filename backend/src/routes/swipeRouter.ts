import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { likeUser, getMatches } from "../controllers/swipeController";

const router = Router();

router.post("/like", authMiddleware, likeUser);

router.get("/matches", authMiddleware, getMatches);

export default router;
