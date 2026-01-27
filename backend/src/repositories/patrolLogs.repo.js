// src/repositories/patrolLogs.repo.js
const { getPool } = require("../config/db");
const PatrolLog = require("../models/patrolLog.model");

exports.create = async ({
  userId,
  postId,
  photoPath,
  note,
  deviceInfo,
  capturedAt,
}) => {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO patrol_logs
     (user_id, post_id, photo_path, note, device_info, captured_at_server)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, postId, photoPath, note, deviceInfo, capturedAt]
  );

  const [rows] = await pool.query(
    "SELECT * FROM patrol_logs WHERE id = ?",
    [result.insertId]
  );
  return rows.length ? new PatrolLog(rows[0]) : null;
};

exports.list = async ({ dateFrom, dateTo, postId, userId }) => {
  const pool = await getPool();

  const conditions = [];
  const values = [];

  if (dateFrom) {
    conditions.push("captured_at_server >= ?");
    values.push(dateFrom);
  }
  if (dateTo) {
    conditions.push("captured_at_server <= ?");
    values.push(dateTo);
  }
  if (postId) {
    conditions.push("post_id = ?");
    values.push(postId);
  }
  if (userId) {
    conditions.push("user_id = ?");
    values.push(userId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT * FROM patrol_logs ${where} ORDER BY captured_at_server DESC`,
    values
  );

  return rows.map((r) => new PatrolLog(r));
};
