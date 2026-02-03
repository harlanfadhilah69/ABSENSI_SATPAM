// src/services/token.service.js
const crypto = require("crypto");
const patrolConfig = require("../config/patrol");

// FUNGSI BARU: Membuat token hanya berdasarkan ID Pos (Tanpa Waktu)
function hmacToken(postId) {
  const data = String(postId); // Data yang dienkripsi HANYA ID Pos
  return crypto
    .createHmac("sha256", patrolConfig.TOKEN_SECRET)
    .update(data)
    .digest("hex")
    .slice(0, 16); // token pendek utk QR
}

// GENERATE TOKEN: Sekarang tokennya statis/abadi
exports.generateToken = ({ postId }) => {
  return hmacToken(postId);
};

// VALIDASI TOKEN: Langsung cocokkan token tanpa toleransi waktu
exports.validateToken = ({ postId, token }) => {
  if (!postId || !token) return false;

  // Cek apakah token yang dikirim sama dengan token abadi milik Pos tersebut
  const validToken = hmacToken(postId);
  return token === validToken;
};

// Fungsi ini tidak dipakai lagi tapi dibiarkan agar tidak error jika dipanggil tempat lain
exports.getCurrentWindow = () => 0;