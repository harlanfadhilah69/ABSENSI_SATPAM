const express = require("express");
const path = require("path");
const cors = require("cors");

const env = require("./config/env");
const routes = require("./routes"); 
const { pingDb } = require("./config/db");
const missionRoutes = require("./routes/missions.routes");
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.18.75:5173", 
      /^http:\/\/192\.168\.0\.\d{1,3}:5173$/ 
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"))
);

/**
 * ✅ 1. DAFTARKAN RUTE MISI DI SINI (SEBELUM 404)
 * Pindahkan baris ini ke atas agar terbaca oleh Express
 */
app.use("/api/missions", missionRoutes); 

/**
 * ✅ 2. DAFTARKAN RUTE UTAMA LAINNYA
 */
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

/**
 * ❌ 3. 404 handler HARUS SELALU PALING BAWAH
 */
app.use((req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

// Global error handler
app.use((err, req, res, next) => {
  const msg = err?.message || "Internal Server Error";
  const code = err?.statusCode || 500;
  res.status(code).json({ message: msg });
});

module.exports = app;