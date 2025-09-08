import { Router } from "express";
import { getAllTechnologies } from "../controllers/technologyController";

const router = Router();

router.get("/", getAllTechnologies);

export default router;
