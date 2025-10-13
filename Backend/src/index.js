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

// Single CORS configuration
app.use(cors({
    origin: FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(bodyParser.json());
app.use(passport.initialize());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/auth", authRoutes);
app.use("/content", contentRoutes);

// Conditionally start the server for local development, not when imported as a module
if (process.env.NODE_ENV !== 'production' || process.env.IS_AZURE_STATIC_WEB_APPS_API !== 'true') {
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

export default app;