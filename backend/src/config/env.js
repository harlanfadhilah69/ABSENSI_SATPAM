// src/config/env.js
const dotenv = require("dotenv");

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 3000),

  // Auth
  JWT_SECRET: process.env.JWT_SECRET || "CHANGE_THIS_SECRET",

  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "absensi_satpam",

  // Upload
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads/patrol_photos",
  MAX_UPLOAD_MB: Number(process.env.MAX_UPLOAD_MB || 5),
};

module.exports = env;
