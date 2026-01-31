// src/routes/auth.routes.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Pastikan ini ADA dan authController.register/login benar-benar function
router.post("/register", authController.register);
router.post("/login", authController.login);

// /auth/me harus pakai middleware auth biar req.user ada
router.get("/me", authMiddleware, authController.me);

module.exports = router;
