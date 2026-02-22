// ✅ Import dbConfig yang berisi fungsi getPool
const dbConfig = require("../config/db"); 

/**
 * 1. MENGAMBIL DAFTAR MISI (Untuk Satpam)
 */
const getMyMissions = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    const userId = req.user.id;
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());

    const [rows] = await db.query(
      `SELECT pm.*, p.post_name, p.location_desc 
       FROM patrol_missions pm
       JOIN posts p ON pm.post_id = p.id
       WHERE pm.user_id = ? AND pm.mission_date = ?
       ORDER BY pm.status DESC, p.post_name ASC`, 
      [userId, today]
    );

    const total = rows.length;
    const completed = rows.filter(r => r.status === 'completed').length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return res.json({
      message: "Misi berhasil dimuat",
      progress: progressPercent,
      total_pos: total,
      completed_pos: completed,
      data: rows
    });
  } catch (err) { 
    next(err); 
  }
};

/**
 * 2. UPDATE STATUS MISI (Internal Helper)
 */
const completeMission = async (userId, postId) => {
  try {
    const db = await dbConfig.getPool();
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());

    const [result] = await db.query(
      `UPDATE patrol_missions SET status = 'completed', completed_at = NOW() 
       WHERE user_id = ? AND post_id = ? AND mission_date = ? AND status = 'pending'`,
      [userId, postId, today]
    );
    return result.affectedRows > 0;
  } catch (err) { 
    console.error("Gagal update misi:", err.message);
    return false; 
  }
};

/**
 * 3. MONITORING SEMUA SATPAM (Untuk Admin)
 * Fungsi ini yang tadi menyebabkan error karena belum didefinisikan
 */
const getAllSatpamMissions = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    // Gunakan format YYYY-MM-DD yang standar
    const today = new Intl.DateTimeFormat('en-CA').format(new Date()); 

    const [rows] = await db.query(`
      SELECT 
        u.id, u.name,
        (SELECT COUNT(*) FROM patrol_missions WHERE user_id = u.id AND mission_date = ?) as total_pos,
        (SELECT COUNT(*) FROM patrol_missions WHERE user_id = u.id AND mission_date = ? AND status = 'completed') as completed_pos,
        IFNULL(ROUND(
          (SELECT COUNT(*) FROM patrol_missions WHERE user_id = u.id AND mission_date = ? AND status = 'completed') / 
          NULLIF((SELECT COUNT(*) FROM patrol_missions WHERE user_id = u.id AND mission_date = ?), 0) * 100
        ), 0) as progress
      FROM users u
      WHERE u.role = 'satpam'
      GROUP BY u.id, u.name
    `, [today, today, today, today]);

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// ✅ missions.controller.js
const getDashboardData = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

    // 1. Ambil Aktivitas Terbaru
    // ✅ Gunakan DATE_FORMAT agar Node.js tidak mengubah zona waktunya lagi
    const [recentActivities] = await db.query(`
      SELECT 
        u.name as satpam_name, 
        p.post_name, 
        DATE_FORMAT(r.created_at, '%Y-%m-%dT%H:%i:%s') as created_at
      FROM patrol_logs r
      JOIN users u ON r.user_id = u.id
      JOIN posts p ON r.post_id = p.id
      WHERE DATE(r.created_at) = ?
      ORDER BY r.created_at DESC 
      LIMIT 10
    `, [today]);

    // 2. Ambil Peringatan (Tugas Pending)
    const [alerts] = await db.query(`
      SELECT u.name as satpam_name, p.post_name
      FROM patrol_missions pm
      JOIN users u ON pm.user_id = u.id
      JOIN posts p ON pm.post_id = p.id
      WHERE pm.mission_date = ? AND pm.status = 'pending'
    `, [today]);

    // 3. Hitung Total Hari Ini
    const [stats] = await db.query(`
      SELECT COUNT(*) as todayCount FROM patrol_logs WHERE DATE(created_at) = ?
    `, [today]);

    res.json({ 
      success: true, 
      todayCount: stats[0].todayCount || 0,
      recentActivities,
      alerts
    });
  } catch (err) { 
    console.error("Dashboard Sync Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
// ✅ EKSPOR SEMUA SEBAGAI OBJEK
module.exports = {
  getMyMissions,
  completeMission,
  getAllSatpamMissions,
  getDashboardData, // Sekarang sudah aman karena fungsi di atas sudah ada
};