import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware"; // adjust path
import { updateProfile, getProfile } from "../controllers/profileController"; // adjust path

const router = Router();

// protected route to update your own profile
router.put("/", authMiddleware, updateProfile);

// public route to view any user's profile
router.get("/:userId", getProfile);

export default router;
