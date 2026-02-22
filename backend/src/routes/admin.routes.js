// backend/src/routes/admin.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const active = require("../middlewares/active.middleware");

const postsController = require("../controllers/admin/posts.controller");
const reportsController = require("../controllers/admin/reports.controller");
const usersController = require("../controllers/admin/users.controller");

// ✅ JALUR 1: Jalur untuk Melihat (Admin & Viewer Boleh Masuk)
// Digunakan untuk fungsi GET/Membaca data
const canView = [auth, role(["admin", "viewer"]), active];

// ✅ JALUR 2: Jalur untuk Eksekusi (Hanya Admin yang Boleh)
// Digunakan untuk fungsi Create, Update, Delete
const adminOnly = [auth, role(["admin"]), active];

// ==========================================
// 🏢 MANAJEMEN POS (Admin & Viewer)
// ==========================================

// Admin & Viewer boleh melihat daftar dan detail pos
router.get("/posts", ...canView, postsController.list);
router.get("/posts/:id", ...canView, postsController.getPostById);

// HANYA Admin yang boleh memodifikasi data pos
router.post("/posts", ...adminOnly, postsController.create);
router.put("/posts/:id", ...adminOnly, postsController.update);
router.delete("/posts/:id", ...adminOnly, postsController.remove);
router.get("/posts/:id/qr", ...adminOnly, postsController.qrLink);

// ==========================================
// 📄 LAPORAN PATROLI (Admin & Viewer)
// ==========================================

// Admin & Viewer boleh melihat laporan
router.get("/reports", ...canView, reportsController.listLogs);

// HANYA Admin yang boleh menghapus histori laporan
router.delete("/reports/:id", ...adminOnly, reportsController.deleteLog);

// ==========================================
// 👥 KELOLA USER (Admin & Viewer)
// ==========================================

// Admin & Viewer boleh melihat daftar user
router.get("/users", ...canView, usersController.list);

// HANYA Admin yang boleh mengelola akun (Tambah, Ganti Role, Reset Password, Hapus)
router.post("/users", ...adminOnly, usersController.create);
router.put("/users/:id/role", ...adminOnly, usersController.updateRole);
router.put("/users/:id/password", ...adminOnly, usersController.resetPassword);
router.delete("/users/:id", ...adminOnly, usersController.remove);

module.exports = router;