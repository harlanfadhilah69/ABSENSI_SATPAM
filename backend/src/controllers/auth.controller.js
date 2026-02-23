const jwt = require("jsonwebtoken");
const env = require("../config/env");
const usersRepo = require("../repositories/users.repo");
const dbConfig = require("../config/db"); 

// ✅ Fungsi setupDailyMissions SUDAH DIHAPUS agar misi tidak terbuat otomatis saat login

exports.register = async (req, res, next) => {
  try {
    const { name, email, username, password, role } = req.body;
    if (!email || !username || !password || !role) {
      return res.status(400).json({ message: "Field wajib diisi" });
    }

    const exists = await usersRepo.findByUsername(username);
    if (exists) return res.status(409).json({ message: "Username sudah dipakai" });

    const created = await usersRepo.create({ 
      name, email, username, password, 
      role: role.toLowerCase().trim() 
    });
    return res.status(201).json({ message: "Register berhasil ✅", data: created });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const row = await usersRepo.findByUsername(username);
    
    if (!row || !(await usersRepo.verifyPassword(password, row.password_hash))) {
      return res.status(401).json({ message: "Username / password salah" });
    }

    const cleanRole = row.role.toLowerCase().trim();

    // ✅ SEKARANG LOGIN BERSIH: Tidak ada setupDailyMissions di sini
    // Misi hanya akan ada jika Admin memberikan tugas secara manual

    const token = jwt.sign({ id: row.id, role: cleanRole }, env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({ 
      message: "Login berhasil", 
      token, 
      user: { id: row.id, name: row.name, role: cleanRole } 
    });
  } catch (err) { next(err); }
};

exports.me = async (req, res) => {
  return res.json({ user: req.user });
};