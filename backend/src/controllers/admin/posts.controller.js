// src/controllers/admin/posts.controller.js
const postsRepo = require("../../repositories/posts.repo");
const tokenService = require("../../services/token.service");

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
    if (!post_name) return res.status(400).json({ message: "post_name wajib" });

    const created = await postsRepo.create({ post_name, location_desc: location_desc || "" });
    res.status(201).json({ message: "Pos berhasil dibuat", data: created });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await postsRepo.update(id, req.body);
    res.json({ message: "Pos berhasil diupdate", data: updated });
  } catch (err) {
    next(err);
  }
};

exports.qrLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postsRepo.findById(id);
    if (!post) return res.status(404).json({ message: "Pos tidak ditemukan" });

    // token saat ini (untuk jadi QR)
    const token = tokenService.generateToken({ postId: id });

    // link yang akan di-QR-kan
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/patrol/scan?post_id=${id}&token=${token}`;

    res.json({ post: { id: post.id, post_name: post.post_name }, url, token });
  } catch (err) {
    next(err);
  }
};
