// src/controllers/admin/posts.controller.js
const postsRepo = require("../../repositories/posts.repo");
const tokenService = require("../../services/token.service");
const env = require("../../config/env");

function normalizeBaseUrl(u) {
  return String(u || "").replace(/\/+$/, "");
}

exports.list = async (req, res, next) => {
  try {
    const posts = await postsRepo.list();
    res.json({ data: posts });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { post_name, location_desc } = req.body;
    if (!post_name) {
      return res.status(400).json({ message: "post_name wajib" });
    }

    const created = await postsRepo.create({
      post_name,
      location_desc: location_desc || "",
    });

    res.status(201).json({
      message: "Pos berhasil dibuat",
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await postsRepo.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Pos tidak ditemukan" });
    }

    res.json({
      message: "Pos berhasil diupdate",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const affected = await postsRepo.deleteById(id);

    if (!affected) {
      return res.status(404).json({ message: "Pos tidak ditemukan" });
    }

    res.json({ message: "Pos berhasil dihapus ✅" });
  } catch (err) {
    next(err);
  }
};

exports.qrLink = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await postsRepo.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Pos tidak ditemukan" });
    }

    const token = tokenService.generateToken({ postId: Number(id) });

    const frontendBase = normalizeBaseUrl(
      env.FRONTEND_URL || "http://localhost:5173"
    );

    const url = `${frontendBase}/scan?post_id=${encodeURIComponent(
      id
    )}&token=${encodeURIComponent(token)}`;

    res.json({
      post: {
        id: post.id,
        post_name: post.post_name,
      },
      url,
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Panggil repository untuk ambil 1 data saja
    const post = await postsRepo.findById(id); 

    if (!post) {
      return res.status(404).json({ message: "Pos tidak ditemukan" });
    }

    res.json({ data: post }); // ✅ Kirim data ke frontend
  } catch (err) {
    next(err);
  }
};
