const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const patrolRoutes = require("./patrol.routes");
const satpamRoutes = require("./satpam.routes");

// Tambahkan ini supaya localhost:3000 tidak error 404
router.get("/", (req, res) => {
    res.json({ message: "API Absensi Satpam v1.0.0" });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/patrol", patrolRoutes);
router.use("/satpam", satpamRoutes);

module.exports = router;