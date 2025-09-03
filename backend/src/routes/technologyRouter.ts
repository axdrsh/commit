import { Router } from "express";
import { getAllTechnologies } from "../controllers/technologyController";

const router = Router();

// Public route to get all available technologies
router.get("/", getAllTechnologies);

export default router;
