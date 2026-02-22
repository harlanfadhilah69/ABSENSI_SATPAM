const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const patrolRoutes = require("./patrol.routes");
const satpamRoutes = require("./satpam.routes");
const missionsRoutes = require("./missions.routes");

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/patrol", patrolRoutes);
router.use("/satpam", satpamRoutes);
router.use("/missions", missionsRoutes); // ✅ Rute jadi: /missions/admin/monitor

module.exports = router;