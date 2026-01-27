// src/config/patrol.js
const env = require("./env");

module.exports = {
  // Token QR berubah tiap berapa detik
  TOKEN_WINDOW_SECONDS: Number(process.env.TOKEN_WINDOW_SECONDS || 60),

  // Toleransi validasi (mis. delay jaringan) -> cek window sekarang ± 1
  TOKEN_WINDOW_TOLERANCE: Number(process.env.TOKEN_WINDOW_TOLERANCE || 1),

  // Secret untuk HMAC token (gunakan yang aman di .env)
  TOKEN_SECRET: process.env.TOKEN_SECRET || env.JWT_SECRET,

  // Batasi submit pos yang sama dalam rentang ini (anti spam)
  MIN_SECONDS_BETWEEN_SAME_POST: Number(
    process.env.MIN_SECONDS_BETWEEN_SAME_POST || 30
  ),
};
