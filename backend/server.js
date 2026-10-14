const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// IMPORTANT: connection info comes from env vars, not hardcoded.
// Jab tum Docker seekhoge, ye "DATABASE_URL" tum docker-compose.yml se
// environment: block ke through pass karoge. Filhaal local test ke liye
// tum apne system par ek .env file bana sakte ho (dekho .env.example).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://appuser:apppass@localhost:5432/appdb",
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDb().catch((err) => console.error("DB init failed:", err.message));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.post("/api/items", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  try {
    const result = await pool.query(
      "INSERT INTO items (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
