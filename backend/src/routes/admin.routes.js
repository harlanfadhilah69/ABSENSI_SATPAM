const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const active = require("../middlewares/active.middleware");

const postsController = require("../controllers/admin/posts.controller");
const reportsController = require("../controllers/admin/reports.controller");
const usersController = require("../controllers/admin/users.controller");
const missionsController = require("../controllers/missions.controller");

const canView = [auth, role(["admin", "viewer"]), active];
const adminOnly = [auth, role(["admin"]), active];

// ==========================================
// 📊 DASHBOARD & MONITORING
// ==========================================
router.get("/dashboard-stats", ...canView, missionsController.getDashboardData);
router.get("/monitor", ...canView, missionsController.getAllSatpamMissions);

// ✅ TAMBAHKAN RUTE INI: Detail progress per satpam
router.get("/monitor/detail/:userId", ...canView, missionsController.getMissionDetail);

// ==========================================
// 🏢 MANAJEMEN POS
// ==========================================
router.get("/posts", ...canView, postsController.list);
router.get("/posts/:id", ...canView, postsController.getPostById);
router.post("/posts", ...adminOnly, postsController.create);
router.put("/posts/:id", ...adminOnly, postsController.update);
router.get("/posts/:id/qr", ...adminOnly, postsController.qrLink);
router.patch("/posts/:id/toggle", ...adminOnly, postsController.toggleStatus);

// ==========================================
// 📄 LAPORAN PATROLI
// ==========================================
router.get("/reports", ...canView, reportsController.listLogs);
router.delete("/reports/:id", ...adminOnly, reportsController.deleteLog);

// ==========================================
// 👥 KELOLA USER & MISI
// ==========================================
router.get("/users", ...canView, usersController.list);
router.post("/users", ...adminOnly, usersController.create);
router.put("/users/:id/role", ...adminOnly, usersController.updateRole);
router.put("/users/:id/password", ...adminOnly, usersController.resetPassword);
router.delete("/users/:id", ...adminOnly, usersController.remove);
router.post("/assign-mission", ...adminOnly, missionsController.assignMission);

module.exports = router;