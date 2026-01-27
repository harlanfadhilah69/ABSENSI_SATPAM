// src/repositories/posts.repo.js
const { getPool } = require("../config/db");
const Post = require("../models/post.model");

exports.list = async () => {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT * FROM posts ORDER BY created_at DESC"
  );
  return rows.map((r) => new Post(r));
};

exports.findById = async (id) => {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT * FROM posts WHERE id = ? LIMIT 1",
    [id]
  );
  return rows.length ? new Post(rows[0]) : null;
};

exports.create = async ({ post_name, location_desc }) => {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO posts (post_name, location_desc, is_active)
     VALUES (?, ?, 1)`,
    [post_name, location_desc]
  );
  return this.findById(result.insertId);
};

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

  if (!fields.length) return this.findById(id);

  values.push(id);

  const pool = await getPool();
  await pool.query(
    `UPDATE posts SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return this.findById(id);
};
