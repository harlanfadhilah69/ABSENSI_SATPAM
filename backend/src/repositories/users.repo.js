// src/repositories/users.repo.js
const bcrypt = require("bcryptjs");
const { getPool } = require("../config/db");
const User = require("../models/user.model");

const SALT_ROUNDS = 10;

exports.findById = async (id) => {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows.length ? new User(rows[0]) : null;
};

exports.findByUsername = async (username) => {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username]
  );
  return rows.length ? rows[0] : null; // raw row (for password check)
};

exports.verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

exports.listSatpam = async () => {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT id, name, username, role, is_active, created_at FROM users WHERE role = 'satpam'"
  );
  return rows.map((r) => new User(r));
};

exports.createSatpam = async ({ name, username, password }) => {
  const pool = await getPool();
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await pool.query(
    `INSERT INTO users (name, username, password_hash, role, is_active)
     VALUES (?, ?, ?, 'satpam', 1)`,
    [name, username, hash]
  );

  return this.findById(result.insertId);
};

exports.updateUser = async (id, payload) => {
  const fields = [];
  const values = [];

  if (payload.name) {
    fields.push("name = ?");
    values.push(payload.name);
  }
  if (payload.username) {
    fields.push("username = ?");
    values.push(payload.username);
  }
  if (payload.password) {
    fields.push("password_hash = ?");
    values.push(await bcrypt.hash(payload.password, SALT_ROUNDS));
  }

  if (!fields.length) return this.findById(id);

  values.push(id);

  const pool = await getPool();
  await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return this.findById(id);
};

exports.setActive = async (id, isActive) => {
  const pool = await getPool();
  await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [
    isActive ? 1 : 0,
    id,
  ]);
  return this.findById(id);
};
