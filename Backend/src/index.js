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

app.use(cors({
    origin: ["http://localhost:3000"], // allow your React app
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));


app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; connect-src 'self' http://localhost:3000 http://localhost:5000 ws://localhost:5000; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
    );
    next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/content", contentRoutes);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));


