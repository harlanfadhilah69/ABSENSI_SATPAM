const postsRepo = require("../../repositories/posts.repo");
const tokenService = require("../../services/token.service");
const dbConfig = require("../../config/db"); // Tambahkan ini untuk akses db langsung

exports.list = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    
    // Jangan pakai WHERE is_active = 1 di sini agar Admin tetap bisa lihat
    const [rows] = await db.query(
      "SELECT * FROM posts ORDER BY is_active DESC, post_name ASC"
    );

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { post_name, location_desc, lat, lng } = req.body;
    if (!post_name) {
      return res.status(400).json({ message: "post_name wajib diisi" });
    }
    const created = await postsRepo.create({
      post_name,
      location_desc: location_desc || "",
      lat: lat || null,
      lng: lng || null,
    });
    res.status(201).json({ message: "Pos berhasil dibuat ✅", data: created });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await postsRepo.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Pos tidak ditemukan" });
    }
    res.json({ message: "Pos berhasil diupdate", data: updated });
  } catch (err) { next(err); }
};

/**
 * ✅ PENGGANTI HAPUS: TOGGLE STATUS (SOFT DELETE)
 * Mengubah status Aktif (1) menjadi Nonaktif (0) agar data laporan tidak hilang
 */
exports.toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await dbConfig.getPool();

    // Cek status saat ini
    const [post] = await db.query("SELECT is_active FROM posts WHERE id = ?", [id]);
    if (post.length === 0) return res.status(404).json({ message: "Pos tidak ditemukan" });

    // Balikkan status (Toggle)
    const newStatus = post[0].is_active === 1 ? 0 : 1;
    await db.query("UPDATE posts SET is_active = ? WHERE id = ?", [newStatus, id]);

    res.json({ 
      success: true, 
      message: newStatus === 1 ? "Pos Diaktifkan Kembali ✅" : "Pos Dinonaktifkan (Arsip Aman) 📂",
      data: { is_active: newStatus }
    });
  } catch (err) { next(err); }
};

exports.qrLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postsRepo.findById(id);
    if (!post) return res.status(404).json({ message: "Pos tidak ditemukan" });

    const token = tokenService.generateToken({ postId: Number(id) });
    const ipServer = "192.168.18.75"; 
    const fullUrl = `http://${ipServer}:5173/scan?post_id=${id}&token=${token}`;

    res.json({
      success: true,
      post: { id: post.id, post_name: post.post_name },
      url: fullUrl,
      token,
    });
  } catch (err) { next(err); }
};

exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postsRepo.findById(id);
    if (!post) return res.status(404).json({ message: "Pos tidak ditemukan" });
    res.json({ data: post });
  } catch (err) { next(err); }
};

module.exports = {
  list: exports.list,
  create: exports.create,
  update: exports.update,
  toggleStatus: exports.toggleStatus, // ✅ Pastikan ini ada
  qrLink: exports.qrLink,
  getPostById: exports.getPostById
};