// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const usersRepo = require("../repositories/users.repo");

/**
 * Middleware: require login (JWT).
 * Header: Authorization: Bearer <token>
 */
module.exports = async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized: token tidak ada" });
    }

    const payload = jwt.verify(token, env.JWT_SECRET);

    // Ambil user terbaru dari DB (role & active bisa berubah)
    const user = await usersRepo.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Unauthorized: user tidak ditemukan" });

    req.user = {
      id: user.id,
      name: user.name,
      role: user.role,
      is_active: Boolean(user.is_active),
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: token invalid/expired" });
  }
};
