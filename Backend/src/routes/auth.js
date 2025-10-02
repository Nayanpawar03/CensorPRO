import express from "express";
import passport from "passport";
import { registerUser, loginUser, logoutUser } from "../controllers/authController.js";
import { signToken } from "../utils/jwt.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const { FRONTEND_URL } = process.env;

// Manual auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/failure" }),
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(`${FRONTEND_URL}/Dashboard#?token=${token}`);
  }
);

router.get("/failure", (req, res) => res.send("Authentication failed"));

export default router;
