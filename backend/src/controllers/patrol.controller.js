// src/controllers/patrol.controller.js
const postsRepo = require("../repositories/posts.repo");
const patrolService = require("../services/patrol.service");
const tokenService = require("../services/token.service");

// ✅ 1. FUNGSI SCAN (INI YANG BIKIN HP NYANGKUT TADI)
exports.scan = async (req, res, next) => {
  try {
    const { post_id, token } = req.query;

    if (!post_id || !token) {
      return res.status(400).json({ message: "post_id dan token wajib ada" });
    }

    // Cek apakah pos ada di database
    const post = await postsRepo.findById(post_id);
    if (!post || !post.is_active) {
      return res.status(404).json({ message: "Pos tidak ditemukan / tidak aktif" });
    }

    // Validasi Token (Memakai fungsi statis yang anti-kadaluarsa)
    const valid = tokenService.validateToken({ postId: post_id, token });
    if (!valid) {
      return res.status(401).json({ message: "Token QR tidak valid" });
    }

    // ✅ WAJIB ADA: Kirim jawaban sukses ke HP Satpam agar loading berhenti
    return res.json({
      message: "Scan berhasil",
      post: post
    });

  } catch (err) {
    next(err);
  }
};


// ✅ 2. FUNGSI SUBMIT (Kodinganmu sudah benar, saya rapikan saja)
exports.submit = async (req, res, next) => {
  try {
    const user = req.user;
    const { post_id, token, note, lat, lng, accuracy } = req.body;

    if (!post_id) {
      return res.status(400).json({ message: "post_id wajib ada" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Foto selfie wajib diupload" });
    }

    const post = await postsRepo.findById(post_id);
    if (!post || !post.is_active) {
      return res.status(404).json({ message: "Pos tidak ditemukan / tidak aktif" });
    }

    // Logika QR vs Manual
    if (token) {
      const valid = tokenService.validateToken({ postId: post_id, token });
      if (!valid) {
        return res.status(401).json({ message: "Token QR tidak valid" });
      }
    } else {
      console.log(`[INFO] User ${user.id} melakukan input manual untuk Pos ${post_id}`);
    }

    // Parsing GPS
    const parsedLat = lat !== undefined && lat !== "" ? Number(lat) : null;
    const parsedLng = lng !== undefined && lng !== "" ? Number(lng) : null;
    const parsedAcc = accuracy !== undefined && accuracy !== "" ? Number(accuracy) : null;

    // Simpan ke Database
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