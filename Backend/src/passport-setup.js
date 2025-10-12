import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
import pool from "./db.js";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_URL } = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;

        // ✅ Check if a user already exists by google_id OR email
        let result = await pool.query(
          "SELECT * FROM users WHERE google_id = $1 OR email = $2",
          [googleId, email]
        );
        let user = result.rows[0];

        if (!user) {
          // ✅ Create a new user only if not found
          const insert = await pool.query(
            "INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING *",
            [googleId, email, name]
          );
          user = insert.rows[0];
        } else if (!user.google_id) {
          // ✅ If user exists (from email signup) but no google_id, link it
          const update = await pool.query(
            "UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *",
            [googleId, email]
          );
          user = update.rows[0];
        }

        return done(null, user);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);
