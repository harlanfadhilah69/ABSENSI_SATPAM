const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const active = require("../middlewares/active.middleware");

const patrolHistory = require("../controllers/satpam/patrolHistory.controller");

// ✅ Endpoint: GET /satpam
// Ditambahkan agar tidak muncul "Route tidak ditemukan" saat akses root satpam
router.get(
  "/",
  auth,
  role(["satpam"]),
  active,
  (req, res) => {
    res.json({
      message: "Dashboard Satpam API",
      user: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      }
    });
  }
);

// ✅ Endpoint: GET /satpam/patrol/logs
// Sesuai dengan yang kamu coba di Thunder Client
router.get(
  "/patrol/logs",
  auth,
  role(["satpam"]),
  active,
  patrolHistory.myLogs
);

module.exports = router;