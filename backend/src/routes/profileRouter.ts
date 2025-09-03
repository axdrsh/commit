import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware"; // adjust path
import {
  updateProfile,
  getProfile,
  addTechnologyToProfile,
  removeTechnologyFromProfile,
} from "../controllers/profileController"; // adjust path

const router = Router();

// protected route to update your own profile
router.put("/", authMiddleware, updateProfile);

// public route to view any user's profile
router.get("/:userId", getProfile);

// protected route to add technology to your profile
router.post("/tech", authMiddleware, addTechnologyToProfile);

// protected route to remove technology from your profile
router.delete("/tech/:techId", authMiddleware, removeTechnologyFromProfile);

export default router;
