const express = require("express");
const router = express.Router();
const missionsController = require("../controllers/missions.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Rute untuk satpam
router.get("/my-missions", authMiddleware, missionsController.getMyMissions);

// ✅ PERBAIKAN: Gunakan rute pendek saja di sini
router.get("/monitor", authMiddleware, missionsController.getAllSatpamMissions);
router.get("/dashboard-stats", authMiddleware, missionsController.getDashboardData);
module.exports = router;