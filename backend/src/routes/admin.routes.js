// src/routes/admin.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const usersController = require("../controllers/admin/users.controller");
const postsController = require("../controllers/admin/posts.controller");
const reportsController = require("../controllers/admin/reports.controller");

// middleware global admin
router.use(auth, role(["admin"]));

// users (satpam)
router.get("/users", usersController.list);
router.post("/users", usersController.create);
router.patch("/users/:id", usersController.update);
router.patch("/users/:id/active", usersController.setActive);

// posts (pos patroli)
router.get("/posts", postsController.list);
router.post("/posts", postsController.create);
router.patch("/posts/:id", postsController.update);
router.get("/posts/:id/qr", postsController.qrLink);

// reports
router.get("/reports/patrol-logs", reportsController.listLogs);

module.exports = router;
