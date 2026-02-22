const postsRepo = require("../../repositories/posts.repo");
const tokenService = require("../../services/token.service");
const env = require("../../config/env");

// ✅ Fungsi untuk memastikan URL tidak berantakan
function normalizeBaseUrl(u) {
  return String(u || "").replace(/\/+$/, "");
}

exports.list = async (req, res, next) => {
  try {
    const posts = await postsRepo.list();
    res.json({ data: posts });
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
    res.status(201).json({
      message: "Pos berhasil dibuat ✅",
      data: created,
    });
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

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const affected = await postsRepo.deleteById(id);
    if (!affected) {
      return res.status(404).json({ message: "Pos tidak ditemukan" });
    }
    res.json({ message: "Pos berhasil dihapus ✅" });
  } catch (err) { next(err); }
};

/**
 * ✅ PERBAIKAN UTAMA: GENERATE QR LINK
 */
exports.qrLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postsRepo.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: "Pos tidak ditemukan" });
    }

    // Generate Token
    const token = tokenService.generateToken({ postId: Number(id) });
    
    // ✅ Gunakan IP lokal agar HP Satpam bisa akses saat scan
    const ipServer = "192.168.18.75"; 
    const fullUrl = `http://${ipServer}:5173/scan?post_id=${id}&token=${token}`;

    res.json({
      success: true, // Tambahkan status success agar frontend mudah validasi
      post: {
        id: post.id,
        post_name: post.post_name,
      },
      url: fullUrl, // Sekarang link-nya lengkap (Absolute URL)
      token,
    });
  } catch (err) { next(err); }
};

exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postsRepo.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Pos tidak ditemukan" });
    }
    res.json({ data: post });
  } catch (err) { next(err); }
};