// src/middlewares/role.middleware.js

/**
 * Middleware factory: batasi role.
 * Contoh: role(["admin"]) atau role(["satpam","admin"])
 */
module.exports = function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: tidak punya akses" });
    }
    next();
  };
};
