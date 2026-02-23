const express = require("express");
const router = express.Router();

// ✅ Import Middleware
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const active = require("../middlewares/active.middleware");

// ✅ Import Controllers
const postsController = require("../controllers/admin/posts.controller");
const reportsController = require("../controllers/admin/reports.controller");
const usersController = require("../controllers/admin/users.controller");
const missionsController = require("../controllers/missions.controller"); 
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * 🔐 DEFINISI JALUR AKSES (RBAC)
 */
// JALUR 1: Melihat (Admin & Viewer)
const canView = [auth, role(["admin", "viewer"]), active];

// JALUR 2: Eksekusi (Hanya Admin)
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

/**
 * ✅ PERBAIKAN: Menggunakan toggleStatus (Soft Delete)
 * Menggunakan variabel keamanan 'adminOnly' agar sinkron dengan yang lain.
 */
router.patch("/posts/:id/toggle", ...adminOnly, postsController.toggleStatus);
// Generate QR Link
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

// HANYA Admin yang boleh mengelola akun
router.post("/users", ...adminOnly, usersController.create);
router.put("/users/:id/role", ...adminOnly, usersController.updateRole);
router.put("/users/:id/password", ...adminOnly, usersController.resetPassword);
router.delete("/users/:id", ...adminOnly, usersController.remove);
router.get("/assigned-ids/:userId", missionsController.getAssignedPostIds);
router.delete("/delete/:userId/:postId", missionsController.deleteSingleMission);

module.exports = router;