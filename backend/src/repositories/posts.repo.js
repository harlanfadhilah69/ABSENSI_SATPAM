const { getPool } = require("../config/db");
const Post = require("../models/post.model");

exports.list = async () => {
  const pool = await getPool();
  // Ambil semua kolom termasuk lat dan lng
  const [rows] = await pool.query(
    "SELECT * FROM posts ORDER BY created_at DESC"
  );
  return rows.map((r) => new Post(r));
};

exports.findById = async (id) => {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT * FROM posts WHERE id = ? LIMIT 1", // ✅ Simbol * akan mengambil lat dan lng
    [id]
  );
  return rows.length ? new Post(rows[0]) : null;
};

// ✅ PERBAIKAN: Tambahkan lat dan lng agar bisa disimpan ke DB
exports.create = async ({ post_name, location_desc, lat, lng }) => {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO posts (post_name, location_desc, lat, lng, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [post_name, location_desc, lat || null, lng || null]
  );
  return this.findById(result.insertId);
};

// ✅ PERBAIKAN: Tambahkan logika update untuk koordinat
exports.update = async (id, payload) => {
  const fields = [];
  const values = [];

  if (payload.post_name) {
    fields.push("post_name = ?");
    values.push(payload.post_name);
  }
  if (payload.location_desc !== undefined) {
    fields.push("location_desc = ?");
    values.push(payload.location_desc);
  }
  if (payload.is_active !== undefined) {
    fields.push("is_active = ?");
    values.push(payload.is_active ? 1 : 0);
  }
  // Tambahkan pengecekan lat dan lng
  if (payload.lat !== undefined) {
    fields.push("lat = ?");
    values.push(payload.lat);
  }
  if (payload.lng !== undefined) {
    fields.push("lng = ?");
    values.push(payload.lng);
  }

  if (!fields.length) return this.findById(id);

  values.push(id);

  const pool = await getPool();
  await pool.query(
    `UPDATE posts SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return this.findById(id);
};

exports.deleteById = async (id) => {
  const pool = await getPool();

  const [used] = await pool.query(
    "SELECT COUNT(*) AS cnt FROM patrol_logs WHERE post_id = ?",
    [id]
  );

  if ((used[0]?.cnt || 0) > 0) {
    const err = new Error("Pos sudah memiliki histori patroli, tidak bisa dihapus.");
    err.status = 409;
    throw err;
  }

  const [result] = await pool.query(
    "DELETE FROM posts WHERE id = ?",
    [id]
  );

  return result.affectedRows; 
};