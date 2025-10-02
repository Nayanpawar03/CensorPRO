import pool from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
export const upload = multer({ storage });

// Upload content
export const uploadContent = async (req, res) => {
  const userId = req.user.id;
  const text_content = req.body.text_content || null;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if ((!text_content && !image_url) || (text_content && image_url)) {
    return res.status(400).json({ error: "Upload either text or image, not both" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO content (user_id, text_content, image_url, status) VALUES ($1,$2,$3,'pending') RETURNING *",
      [userId, text_content, image_url]
    );
    res.json({ success: true, content: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error uploading content" });
  }
};

// Fetch user's content
export const getUserContent = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM content WHERE user_id=$1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching content" });
  }
};

// Admin queue
export const getAdminQueue = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT c.*, u.email FROM content c JOIN users u ON c.user_id=u.id WHERE status='pending'"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching admin queue" });
  }
};

// Admin review
export const reviewContent = async (req, res) => {
  const contentId = req.params.id;
  const { expert_response, decision } = req.body;

  try {
    const result = await pool.query(
      "UPDATE content SET status='done', expert_response=$1, decision=$2 WHERE id=$3 RETURNING *",
      [expert_response, decision, contentId]
    );
    res.json({ success: true, content: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending admin response" });
  }
};
