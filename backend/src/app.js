// src/app.js
const express = require("express");
const path = require("path");
const cors = require("cors");

const env = require("./config/env");
const routes = require("./routes");
const { pingDb } = require("./config/db");

const app = express();

// ✅ CORS (boleh lebih ketat kalau mau)
app.use(
  cors({
    origin: env.FRONTEND_URL, // contoh: http://localhost:5173
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ Static file untuk foto upload
 * Kalau UPLOAD_DIR = "uploads/patrol_photos"
 * maka URL jadi:
 * http://localhost:3000/uploads/patrol_photos/namafile.jpg
 */
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"))
);

// Routes
app.use("/", routes);

// Health check
app.get("/health", async (req, res) => {
  try {
    await pingDb();
    res.json({ status: "ok", db: "connected", env: env.NODE_ENV });
  } catch (e) {
    res.status(500).json({ status: "error", db: "disconnected", env: env.NODE_ENV });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

// Global error handler
app.use((err, req, res, next) => {
  const msg = err?.message || "Internal Server Error";
  // kalau error punya statusCode, pakai itu
  const code = err?.statusCode || 500;
  res.status(code).json({ message: msg });
});

module.exports = app;
