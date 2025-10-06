import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
import dotenv from "dotenv";

import "./passport-setup.js";
import authRoutes from "./routes/auth.js";
import contentRoutes from "./routes/content.js";

dotenv.config();
const { PORT = 5000, FRONTEND_URL } = process.env;

const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/auth", authRoutes);
app.use("/content", contentRoutes);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
