// src/utils/crypto.js
const crypto = require("crypto");

/**
 * Generate random string (hex)
 * @param {number} length panjang karakter
 */
exports.randomHex = (length = 16) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
};
