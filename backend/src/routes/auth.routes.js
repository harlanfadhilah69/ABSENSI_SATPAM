const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Register & Login (Public)
router.post("/register", authController.register);
router.post("/login", authController.login);

// Get Profile (Private - butuh token)
// Sekarang authController.me sudah didefinisikan, jadi tidak akan crash lagi
router.get("/me", authMiddleware, authController.me);

module.exports = router;