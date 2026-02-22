const jwt = require("jsonwebtoken");
const env = require("../config/env");
const usersRepo = require("../repositories/users.repo");
// ✅ Mengambil objek dbConfig yang berisi fungsi getPool
const dbConfig = require("../config/db"); 

/**
 * FUNGSI PEMBANTU: Setup Misi Harian Satpam
 */
const setupDailyMissions = async (userId) => {
  const today = new Intl.DateTimeFormat('en-CA').format(new Date()); 

  try {
    // ✅ Memanggil fungsi getPool() karena db.js kamu adalah singleton
    const db = await dbConfig.getPool(); 

    const [existing] = await db.query(
      "SELECT id FROM patrol_missions WHERE user_id = ? AND mission_date = ?",
      [userId, today]
    );

    if (existing.length === 0) {
      const [posts] = await db.query("SELECT id FROM posts WHERE is_active = 1");
      
      if (posts.length > 0) {
        const missionValues = posts.map(p => [userId, p.id, today, 'pending']);
        // ✅ Bulk insert misi hari ini
        await db.query(
          "INSERT INTO patrol_missions (user_id, post_id, mission_date, status) VALUES ?",
          [missionValues]
        );
        console.log(`[QuestSystem] ✅ Berhasil buat ${posts.length} misi untuk Satpam ID: ${userId}`);
      }
    }
  } catch (err) {
    console.error("[QuestSystem] ❌ Gagal setup misi:", err.message);
  }
};

// ✅ Pastikan menggunakan exports agar tidak undefined di file rute
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

    // ✅ Setup misi sebelum token dikirim
    if (cleanRole === 'satpam') {
      await setupDailyMissions(row.id);
    }

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