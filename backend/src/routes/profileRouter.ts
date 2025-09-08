import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware"; // adjust path
import {
  updateProfile,
  getProfile,
  addTechnologyToProfile,
  removeTechnologyFromProfile,
  getUsersForDiscovery,
} from "../controllers/profileController"; // adjust path

const router = Router();

router.put("/", authMiddleware, updateProfile);

router.get("/:userId", authMiddleware, getProfile);

router.post("/tech", authMiddleware, addTechnologyToProfile);

router.delete("/tech/:techId", authMiddleware, removeTechnologyFromProfile);

router.get("/users/discover", authMiddleware, getUsersForDiscovery);

export default router;
