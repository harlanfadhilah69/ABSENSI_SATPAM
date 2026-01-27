// src/config/db.js
const mysql = require("mysql2/promise");
const env = require("./env");

let pool;

/**
 * Get a singleton MySQL connection pool.
 */
async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: "Z", // store UTC timestamps
    });
  }
  return pool;
}

/**
 * Simple DB health check.
 */
async function pingDb() {
  const p = await getPool();
  await p.query("SELECT 1");
  return true;
}

module.exports = { getPool, pingDb };
