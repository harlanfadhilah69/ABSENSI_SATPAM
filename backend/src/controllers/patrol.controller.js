const postsRepo = require("../repositories/posts.repo");
const patrolService = require("../services/patrol.service");
const tokenService = require("../services/token.service");
// ✅ IMPORT CONTROLLER MISI UNTUK UPDATE STATUS
const missionsController = require("./missions.controller");

// ✅ 1. FUNGSI SCAN
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

    if (token === "manual_entry") {
      return res.json({
        message: "Mode input manual aktif",
        post: post
      });
    }

    const valid = tokenService.validateToken({ postId: post_id, token });
    if (!valid) {
      return res.status(401).json({ message: "Token QR tidak valid" });
    }

    return res.json({
      message: "Scan berhasil",
      post: post
    });

  } catch (err) {
    next(err);
  }
};


// ✅ 2. FUNGSI SUBMIT (DIPERBAIKI DENGAN LOGIKA MISI)
exports.submit = async (req, res, next) => {
  try {
    const user = req.user; // Diambil dari middleware
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

    if (token && token !== "manual_entry") {
      const valid = tokenService.validateToken({ postId: post_id, token });
      if (!valid) {
        return res.status(401).json({ message: "Token QR tidak valid" });
      }
    }

    const parsedLat = lat ? parseFloat(lat) : null;
    const parsedLng = lng ? parseFloat(lng) : null;
    const parsedAcc = accuracy ? parseFloat(accuracy) : null;

    // Simpan Log Patroli ke Database
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

    // ✅ LOGIKA SINKRONISASI: Tandai misi sebagai 'completed' di tabel missions
    // Kita panggil fungsi completeMission yang sudah kita buat di missions.controller
    await missionsController.completeMission(user.id, post_id);

    res.status(201).json({
      message: "Patroli berhasil disimpan dan misi diperbarui! ✅",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};