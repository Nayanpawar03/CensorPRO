import express from "express";
import {
  uploadContent,
  getUserContent,
  getAdminQueue,
  reviewContent,
  upload,
  getAdminStats,
  aiModeration,
  moderateText,
} from "../controllers/contentController.js";
import { authenticateJWT, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Text moderation endpoint
router.post("/moderate/text", authenticateJWT, moderateText);

// Content goes to AI moderation
router.post("/moderate/ai/:id", aiModeration);

// User upload (text OR image)
router.post("/upload", authenticateJWT, upload.single("image"), uploadContent);

// Fetch user's content
router.get("/my-content", authenticateJWT, getUserContent);

// Admin queue
router.get("/admin/queue", authenticateJWT, isAdmin, getAdminQueue);

// Admin stats
router.get("/admin/stats", authenticateJWT, isAdmin, getAdminStats);

// Admin review
router.post("/admin/review/:id", authenticateJWT, isAdmin, reviewContent);

export default router;
