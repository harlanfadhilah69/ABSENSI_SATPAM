// src/controllers/patrol.controller.js
const postsRepo = require("../repositories/posts.repo");
const patrolService = require("../services/patrol.service");
const tokenService = require("../services/token.service");

exports.scan = async (req, res, next) => {
  try {
    const { post_id, token } = req.query;

    if (!post_id || !token) {
      return res.status(400).json({ message: "post_id dan token wajib ada" });
    }

    const post = await postsRepo.findById(post_id);
    if (!post || !post.is_active) {
      return res.status(404).json({ message: "Pos tidak ditemukan / tidak aktif" });
    }

    const valid = tokenService.validateToken({ postId: post_id, token });
    if (!valid) {
      return res.status(401).json({ message: "Token QR tidak valid / kadaluarsa" });
    }

    res.json({
      message: "Token valid",
      post: { id: post.id, post_name: post.post_name, location_desc: post.location_desc },
    });
  } catch (err) {
    next(err);
  }
};

exports.submit = async (req, res, next) => {
  try {
    const user = req.user;

    // ✅ ambil GPS + data lain dari body
    const { post_id, token, note, lat, lng, accuracy } = req.body;

    if (!post_id || !token) {
      return res.status(400).json({ message: "post_id dan token wajib ada" });
    }

    // foto wajib
    if (!req.file) {
      return res.status(400).json({ message: "Foto selfie wajib diupload" });
    }

    const post = await postsRepo.findById(post_id);
    if (!post || !post.is_active) {
      return res.status(404).json({ message: "Pos tidak ditemukan / tidak aktif" });
    }

    const valid = tokenService.validateToken({ postId: post_id, token });
    if (!valid) {
      return res.status(401).json({ message: "Token QR tidak valid / kadaluarsa" });
    }

    // ✅ parsing GPS supaya tidak string
    const parsedLat = lat !== undefined && lat !== "" ? Number(lat) : null;
    const parsedLng = lng !== undefined && lng !== "" ? Number(lng) : null;
    const parsedAcc = accuracy !== undefined && accuracy !== "" ? Number(accuracy) : null;

    const result = await patrolService.createPatrolLog({
      userId: user.id,
      postId: post_id,
      note: note || "",
      photoFile: req.file,
      deviceInfo: req.headers["user-agent"] || "",
      lat: parsedLat,
      lng: parsedLng,
      accuracy: parsedAcc,
    });

    res.status(201).json({
      message: "Patroli berhasil disimpan",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
