// src/services/storage.service.js
const path = require("path");
const env = require("../config/env");

/**
 * Ubah file multer menjadi path relatif yang kita simpan ke DB.
 * Contoh: uploads/patrol_photos/patrol_123.jpg
 */
exports.getRelativePhotoPath = (multerFile) => {
  if (!multerFile?.filename) return null;
  return path.join(env.UPLOAD_DIR, multerFile.filename).replace(/\\/g, "/");
};
