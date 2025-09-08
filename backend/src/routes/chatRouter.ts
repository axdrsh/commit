import { Router } from "express";
import { getChatHistory, getChatList } from "../controllers/chatController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getChatList);
router.get("/:matchId/messages", authMiddleware, getChatHistory);

export default router;
