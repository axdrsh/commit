import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware"; // adjust path
import {
  updateProfile,
  getProfile,
  addTechnologyToProfile,
  removeTechnologyFromProfile,
  getUsersForDiscovery,
  uploadProfilePicture,
  deleteProfilePicture,
} from "../controllers/profileController"; // adjust path
import upload from "../config/multerConfig";

const router = Router();

router.put("/", authMiddleware, updateProfile);

router.get("/:userId", authMiddleware, getProfile);

router.post("/tech", authMiddleware, addTechnologyToProfile);

router.delete("/tech/:techId", authMiddleware, removeTechnologyFromProfile);

router.get("/users/discover", authMiddleware, getUsersForDiscovery);

// Profile picture routes
router.post(
  "/picture",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.delete("/picture", authMiddleware, deleteProfilePicture);

export default router;
