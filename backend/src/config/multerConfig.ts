import multer from "multer";
import path from "path";
import { Request } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, "uploads/profile-pictures/");
  },
  filename: (req: AuthRequest, file: Express.Multer.File, cb) => {
    // Create unique filename: userId-timestamp.extension
    const userId = req.userId;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${userId}-${timestamp}${extension}`);
  },
});

// File filter to only allow images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

export default upload;
