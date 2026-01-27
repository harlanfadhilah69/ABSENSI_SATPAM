// src/controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const usersRepo = require("../repositories/users.repo");

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username dan password wajib diisi" });
    }

    const user = await usersRepo.findByUsername(username);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Akun tidak ditemukan / tidak aktif" });
    }

    const ok = await usersRepo.verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Password salah" });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  // req.user diisi oleh auth.middleware
  res.json({ user: req.user });
};
