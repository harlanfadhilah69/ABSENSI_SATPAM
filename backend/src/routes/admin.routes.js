// backend/src/routes/admin.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const active = require("../middlewares/active.middleware");

const postsController = require("../controllers/admin/posts.controller");
const reportsController = require("../controllers/admin/reports.controller");

// middleware chain biar tidak ngulang-ngulang
const adminOnly = [auth, role(["admin"]), active];

// ======================
// POS (admin)
// ======================
router.get("/posts", ...adminOnly, postsController.list);
router.post("/posts", ...adminOnly, postsController.create);
router.put("/posts/:id", ...adminOnly, postsController.update);

// ✅ HAPUS POS
router.delete("/posts/:id", ...adminOnly, postsController.remove);

// generate link + token QR untuk pos
router.get("/posts/:id/qr", ...adminOnly, postsController.qrLink);

// ======================
// REPORTS (admin)
// ======================
router.get("/reports", ...adminOnly, reportsController.listLogs);

// ✅ NO 3: HAPUS HISTORI PATROLI (admin)
router.delete("/reports/:id", ...adminOnly, reportsController.deleteLog);

module.exports = router;
