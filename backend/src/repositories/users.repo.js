const bcrypt = require("bcryptjs");
const { getPool } = require("../config/db");

exports.findById = async (id) => {
  const pool = await getPool();
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] || null;
};

exports.findByUsername = async (username) => {
  const pool = await getPool();
  const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
  return rows[0] || null;
};

exports.verifyPassword = async (pw, hash) => bcrypt.compare(pw, hash);

exports.create = async ({ name, email, username, password, role }) => {
  const pool = await getPool();
  const hash = await bcrypt.hash(password, 10);
  const sql = `INSERT INTO users (name, email, username, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, 1)`;
  const [result] = await pool.query(sql, [name, email, username, hash, role]);
  return exports.findById(result.insertId);
};

// ✅ FUNGSI UPDATE USER (Dibutuhkan untuk Reset Password)
exports.updateUser = async (id, payload) => {
  const pool = await getPool();
  const fields = [];
  const values = [];

  // Jika payload berisi password, hash dulu
  if (payload.password) {
    const hash = await bcrypt.hash(payload.password, 10);
    fields.push("password_hash = ?");
    values.push(hash);
  }

  // Jika ada field lain yang ingin diupdate (opsional)
  if (payload.name) { fields.push("name = ?"); values.push(payload.name); }
  if (payload.email) { fields.push("email = ?"); values.push(payload.email); }

  if (fields.length === 0) return true;

  values.push(id);
  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  await pool.query(sql, values);
  return true;
};

exports.listAllUsers = async () => {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT id, name, email, username, role, is_active, created_at FROM users ORDER BY id DESC"
  );
  return rows;
};

exports.updateRole = async (id, role) => {
  const pool = await getPool();
  await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  return true;
};

exports.deleteUser = async (id) => {
  const pool = await getPool();
  await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return true;
};

exports.setActive = async (id, isActive) => {
  const pool = await getPool();
  await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [isActive ? 1 : 0, id]);
  return exports.findById(id);
};

exports.getUserById = exports.findById;