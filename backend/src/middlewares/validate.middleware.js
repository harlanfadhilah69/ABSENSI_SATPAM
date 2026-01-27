// src/middlewares/validate.middleware.js

/**
 * Validate required fields in req.body
 * contoh: validateBody(["username","password"])
 */
exports.validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = requiredFields.filter((f) => !req.body?.[f]);
    if (missing.length > 0) {
      return res.status(400).json({
        message: "Validasi gagal",
        missing,
      });
    }
    next();
  };
};
