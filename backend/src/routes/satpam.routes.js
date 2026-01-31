// backend/src/routes/satpam.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const active = require("../middlewares/active.middleware");

const patrolHistory = require("../controllers/satpam/patrolHistory.controller");

// ✅ histori patroli satpam (milik sendiri)
router.get(
  "/patrol/logs",
  auth,
  role(["satpam"]),
  active,
  patrolHistory.myLogs
);

module.exports = router;
