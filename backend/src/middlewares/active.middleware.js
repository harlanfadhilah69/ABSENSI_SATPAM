// src/middlewares/active.middleware.js

module.exports = function activeMiddleware(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  if (!req.user.is_active) {
    return res.status(403).json({ message: "Akun tidak aktif" });
  }

  next();
};
