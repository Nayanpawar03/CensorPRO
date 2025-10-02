// src/db.js (DIRECT/TCP endpoint - recommended for long-running servers)
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon requires TLS. In most cases `ssl: { rejectUnauthorized: true }` is safe,
  // but if you hit SSL errors in local dev you can set rejectUnauthorized:false.
  ssl: { rejectUnauthorized: false }
});

export default pool;
