import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { likeUser, getMatches } from "../controllers/swipeController";

const router = Router();

// protected route to like a user
router.post("/like", authMiddleware, likeUser);

// protected route to get all matches
router.get("/matches", authMiddleware, getMatches);

export default router;
