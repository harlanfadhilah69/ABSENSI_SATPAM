// backend/src/routes/admin.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const active = require("../middlewares/active.middleware");

const postsController = require("../controllers/admin/posts.controller");
const reportsController = require("../controllers/admin/reports.controller");
// ✅ Import Controller baru untuk User
const usersController = require("../controllers/admin/users.controller");

// middleware chain biar tidak ngulang-ngulang
const adminOnly = [auth, role(["admin"]), active];

// ======================
// POS (admin)
// ======================
router.get("/posts", ...adminOnly, postsController.list);
router.post("/posts", ...adminOnly, postsController.create);
router.put("/posts/:id", ...adminOnly, postsController.update);
router.delete("/posts/:id", ...adminOnly, postsController.remove);
router.get("/posts/:id/qr", ...adminOnly, postsController.qrLink);

// ======================
// REPORTS (admin)
// ======================
router.get("/reports", ...adminOnly, reportsController.listLogs);
router.delete("/reports/:id", ...adminOnly, reportsController.deleteLog);

// ======================
// ✅ USERS (admin) - FITUR BARU
// ======================
// Mendapatkan semua daftar user
router.get("/users", ...adminOnly, usersController.list);

// Mengubah role (Admin <=> Satpam)
router.put("/users/:id/role", ...adminOnly, usersController.updateRole);

// Reset password user oleh admin
router.put("/users/:id/password", ...adminOnly, usersController.resetPassword);

// Menghapus akun user
router.delete("/users/:id", ...adminOnly, usersController.remove);

module.exports = router;