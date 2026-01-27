// src/utils/logger.js
const log = (level, message, meta) => {
  const time = new Date().toISOString();
  const payload = meta ? ` | ${JSON.stringify(meta)}` : "";
  console.log(`[${time}] [${level}] ${message}${payload}`);
};

exports.info = (message, meta) => log("INFO", message, meta);
exports.warn = (message, meta) => log("WARN", message, meta);
exports.error = (message, meta) => log("ERROR", message, meta);
