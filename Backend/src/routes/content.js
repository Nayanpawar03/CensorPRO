import express from "express";
import {
  uploadContent,
  getUserContent,
  getAdminQueue,
  reviewContent,
  upload,
} from "../controllers/contentController.js";
import { authenticateJWT, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User upload (text OR image)
router.post("/upload", authenticateJWT, upload.single("image"), uploadContent);

// Fetch user's content
router.get("/my-content", authenticateJWT, getUserContent);

// Admin queue
router.get("/admin/queue", authenticateJWT, isAdmin, getAdminQueue);

// Admin review
router.post("/admin/review/:id", authenticateJWT, isAdmin, reviewContent);

export default router;
