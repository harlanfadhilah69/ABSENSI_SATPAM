// src/repositories/patrolLogs.repo.js
const { getPool } = require("../config/db");

exports.create = async ({
  userId,
  postId,
  photoPath,
  note,
  deviceInfo,
  capturedAt,
  lat,
  lng,
  accuracy,
}) => {
  const pool = await getPool();

  const [result] = await pool.query(
    `INSERT INTO patrol_logs
      (user_id, post_id, photo_path, note, device_info, captured_at_server, lat, lng, accuracy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      postId,
      photoPath,
      note,
      deviceInfo,
      capturedAt,
      lat ?? null,
      lng ?? null,
      accuracy ?? null,
    ]
  );

  const [rows] = await pool.query(
    `SELECT pl.*,
            u.username AS satpam_name,
            p.post_name AS post_name
     FROM patrol_logs pl
     LEFT JOIN users u ON u.id = pl.user_id
     LEFT JOIN posts p ON p.id = pl.post_id
     WHERE pl.id = ?`,
    [result.insertId]
  );

  return rows[0] || null;
};

exports.list = async ({ dateFrom, dateTo, postId, userId, satpam, pos }) => {
  const pool = await getPool();

  const conditions = [];
  const values = [];

  if (dateFrom) {
    conditions.push("pl.captured_at_server >= CONCAT(?, ' 00:00:00')");
    values.push(dateFrom);
  }
  if (dateTo) {
    conditions.push("pl.captured_at_server <= CONCAT(?, ' 23:59:59')");
    values.push(dateTo);
  }
  if (postId) {
    conditions.push("pl.post_id = ?");
    values.push(postId);
  }
  if (userId) {
    conditions.push("pl.user_id = ?");
    values.push(userId);
  }

  // ✅ filter nama satpam (username / name)
  if (satpam) {
    conditions.push("(u.username LIKE ? OR u.name LIKE ?)");
    values.push(`%${satpam}%`, `%${satpam}%`);
  }

  // ✅ filter pos (nama pos)
  if (pos) {
    conditions.push("p.post_name LIKE ?");
    values.push(`%${pos}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT pl.*,
            u.username AS satpam_name,
            p.post_name AS post_name
     FROM patrol_logs pl
     LEFT JOIN users u ON u.id = pl.user_id
     LEFT JOIN posts p ON p.id = pl.post_id
     ${where}
     ORDER BY pl.captured_at_server DESC`,
    values
  );

  return rows;
};

// ✅ NO 1: hapus 1 histori patroli berdasarkan ID
// return: affectedRows (angka) biar gampang dicek di controller
exports.removeById = async (id) => {
  const pool = await getPool();
  const [result] = await pool.query(
    "DELETE FROM patrol_logs WHERE id = ?",
    [id]
  );
  return result.affectedRows; // 1 = terhapus, 0 = tidak ditemukan
};

// ✅ alias (opsional) kalau ada kode lama yang pakai deleteById
exports.deleteById = exports.removeById;
