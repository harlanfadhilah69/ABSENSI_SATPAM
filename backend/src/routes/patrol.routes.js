// src/routes/patrol.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const active = require("../middlewares/active.middleware");
const upload = require("../middlewares/upload.middleware");

const patrolController = require("../controllers/patrol.controller");

// scan QR (boleh tanpa auth dulu, tapi kita pakai auth agar aman)
router.get(
  "/scan",
  auth,
  role(["satpam"]),
  active,
  patrolController.scan
);

// submit patroli (selfie)
router.post(
  "/submit",
  auth,
  role(["satpam"]),
  active,
  upload.single("photo"),
  patrolController.submit
);

module.exports = router;
