// backend/src/routes/index.js
const express = require("express");
const router = express.Router();

// import routes lain yang sudah ada
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const patrolRoutes = require("./patrol.routes");

// ✅ tambah satpam routes
const satpamRoutes = require("./satpam.routes");

// mount routes
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/patrol", patrolRoutes);
router.use("/auth", require("./auth.routes"));
router.use("/auth", require("./auth.routes"));

// ✅ ini yang baru
router.use("/satpam", satpamRoutes);

module.exports = router;
