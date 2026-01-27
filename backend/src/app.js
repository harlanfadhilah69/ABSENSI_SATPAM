// src/app.js
const express = require("express");
const path = require("path");
const cors = require("cors");

const env = require("./config/env");
const routes = require("./routes");
const { pingDb } = require("./config/db");

const app = express();

// CORS (untuk frontend nanti)
app.use(cors());

// Body parser
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Static file untuk foto upload
// Akses: http://localhost:3000/uploads/patrol_photos/namafile.jpg
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

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
  // multer errors & lainnya
  const msg = err?.message || "Internal Server Error";
  res.status(500).json({ message: msg });
});

module.exports = app;
