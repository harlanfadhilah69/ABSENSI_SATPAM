// src/routes/index.js
const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const patrolRoutes = require("./patrol.routes");

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/patrol", patrolRoutes);

router.get("/", (req, res) => {
  res.json({ message: "API Sistem Absensi & Patroli Satpam" });
});

module.exports = router;
