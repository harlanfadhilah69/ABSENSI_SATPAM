const dbConfig = require("../config/db"); 

/**
 * 1. ADMIN MEMBERIKAN TUGAS
 */
const assignMission = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    const { user_id, post_ids } = req.body; 
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

    // ✅ CEK DULU: Hapus misi lama untuk user ini di hari yang sama sebelum insert baru
    // Ini cara paling ampuh agar tidak ada duplikasi data
    await db.query(
      "DELETE FROM patrol_missions WHERE user_id = ? AND mission_date = ?",
      [user_id, today]
    );

    const queries = post_ids.map(post_id => {
      return db.query(
        "INSERT INTO patrol_missions (user_id, post_id, mission_date, status) VALUES (?, ?, ?, 'pending')",
        [user_id, post_id, today]
      );
    });

    await Promise.all(queries);
    res.json({ success: true, message: "Tugas berhasil diperbarui! 🛡️" });
  } catch (err) { next(err); }
};

/**
 * 2. MENGAMBIL DAFTAR MISI (Untuk Satpam di HP)
 */
const getMyMissions = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    
    // Ambil ID dari token login satpam
    const userId = req.user.id; 
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

    const [rows] = await db.query(
      `SELECT pm.*, p.post_name, p.location_desc 
       FROM patrol_missions pm
       JOIN posts p ON pm.post_id = p.id
       WHERE pm.user_id = ? 
         AND pm.mission_date = ? 
         AND p.is_active = 1
       ORDER BY pm.status DESC, p.post_name ASC`, 
      [userId, today] // ✅ Pastikan userId masuk ke parameter pertama kueri
    );

    const total = rows.length;
    const completed = rows.filter(r => r.status === 'completed').length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return res.json({
      message: "Misi berhasil dimuat",
      progress: progressPercent,
      total_pos: total,
      completed_pos: completed,
      data: rows // Jika kosong, Choi Jiwo akan melihat halaman "Belum ada misi"
    });
  } catch (err) { next(err); }
};

/**
 * 3. UPDATE STATUS MISI
 */
const completeMission = async (userId, postId) => {
  try {
    const db = await dbConfig.getPool();
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

    const [result] = await db.query(
      `UPDATE patrol_missions SET status = 'completed', completed_at = NOW() 
       WHERE user_id = ? AND post_id = ? AND mission_date = ? AND status = 'pending'`,
      [userId, postId, today]
    );
    return result.affectedRows > 0;
  } catch (err) { 
    return false; 
  }
};

/**
 * 4. MONITORING SEMUA SATPAM (Untuk Admin)
 */
const getAllSatpamMissions = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    const [rows] = await db.query(`
      SELECT 
        u.id, u.name,
        COALESCE((SELECT COUNT(*) FROM patrol_missions pm JOIN posts p ON pm.post_id = p.id WHERE pm.user_id = u.id AND pm.mission_date = CURDATE() AND p.is_active = 1), 0) as total_pos,
        COALESCE((SELECT COUNT(*) FROM patrol_missions pm JOIN posts p ON pm.post_id = p.id WHERE pm.user_id = u.id AND pm.mission_date = CURDATE() AND pm.status = 'completed' AND p.is_active = 1), 0) as completed_pos
      FROM users u
      WHERE u.role = 'satpam'
      GROUP BY u.id, u.name
    `);

    const formattedData = rows.map(user => {
      const total = parseInt(user.total_pos) || 0;
      const completed = parseInt(user.completed_pos) || 0;
      return {
        id: user.id,
        name: user.name,
        total_pos: total,
        completed_pos: completed,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });

    res.json({ success: true, data: formattedData });
  } catch (err) { next(err); }
};

/**
 * 5. DASHBOARD STATS
 */
const getDashboardData = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();

    // ✅ 1. Hitung Laporan Hari Ini (Samakan dengan Workbench: CURDATE())
    const [stats] = await db.query(`
      SELECT COUNT(*) as todayCount 
      FROM patrol_logs 
      WHERE DATE(created_at) = CURDATE()
    `);

    // ✅ 2. Aktivitas Terbaru (Gunakan created_at langsung tanpa konversi rumit)
    const [recentActivities] = await db.query(`
      SELECT u.name as satpam_name, p.post_name, 
             DATE_FORMAT(r.created_at, '%H:%i:%s') as created_at
      FROM patrol_logs r
      JOIN users u ON r.user_id = u.id
      JOIN posts p ON r.post_id = p.id
      WHERE DATE(r.created_at) = CURDATE()
      ORDER BY r.id DESC LIMIT 10
    `);

    // 3. Misi yang Belum Terlaksana (Alerts)
    const [alerts] = await db.query(`
      SELECT u.name as satpam_name, p.post_name
      FROM patrol_missions pm
      JOIN users u ON pm.user_id = u.id
      JOIN posts p ON pm.post_id = p.id
      WHERE pm.mission_date = CURDATE() AND pm.status = 'pending' AND p.is_active = 1
    `);

    // Sekarang success: true, todayCount harusnya muncul 6!
    res.json({ 
      success: true, 
      todayCount: stats[0].todayCount || 0, 
      recentActivities, 
      alerts 
    });
  } catch (err) { next(err); }
};

/**
 * ✅ 6. DETAIL PROGRESS POS PER SATPAM (FUNGSI BARU)
 */
const getMissionDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const db = await dbConfig.getPool();

    // ✅ Kueri ini mengambil jam asli dari completed_at tanpa CONVERT_TZ atau penambahan +7
    const [rows] = await db.query(`
      SELECT 
        p.post_name,
        IF(pm.status = 'completed', 1, 0) as status,
        DATE_FORMAT(pm.completed_at, '%H:%i:%s') as check_time
      FROM patrol_missions pm
      JOIN posts p ON pm.post_id = p.id
      WHERE pm.user_id = ? 
        AND pm.mission_date = CURDATE() 
        AND p.is_active = 1
      ORDER BY status DESC, p.post_name ASC
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (err) { 
    console.error("Error Detail Misi:", err.message);
    res.status(500).json({ success: false, message: "Gagal ambil detail pos" });
  }
};

// ✅ Export semua fungsi agar bisa dipakai di routes
module.exports = {
  assignMission,
  getMyMissions,
  completeMission,
  getAllSatpamMissions,
  getDashboardData,
  getMissionDetail
};