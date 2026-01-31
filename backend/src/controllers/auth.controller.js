// src/controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const usersRepo = require("../repositories/users.repo");

exports.register = async (req, res, next) => {
  try {
    const { name = "", username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "username, password, role wajib" });
    }
    if (!["admin", "satpam"].includes(role)) {
      return res.status(400).json({ message: "role harus admin atau satpam" });
    }

    const exists = await usersRepo.findByUsername(username);
    if (exists) {
      return res.status(409).json({ message: "Username sudah dipakai" });
    }

    // ✅ kirim password plain, biar repo yang hash
    // (repo kita: usersRepo.create / createUser sudah handle hash)
    const created = await (usersRepo.createUser
      ? usersRepo.createUser({ name, username, password, role })
      : usersRepo.create({ name, username, password, role }));

    return res.status(201).json({
      message: "Register berhasil",
      data: {
        id: created.id,
        name: created.name,
        username: created.username,
        role: created.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username dan password wajib" });
    }

    const row = await usersRepo.findByUsername(username);
    if (!row) return res.status(401).json({ message: "Username / password salah" });
    if (row.is_active === 0) return res.status(403).json({ message: "Akun nonaktif" });

    const ok = await usersRepo.verifyPassword(password, row.password_hash);
    if (!ok) return res.status(401).json({ message: "Username / password salah" });

    const token = jwt.sign(
      { id: row.id, role: row.role, username: row.username },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login berhasil",
      token,
      user: { id: row.id, name: row.name, username: row.username, role: row.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    return res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};
