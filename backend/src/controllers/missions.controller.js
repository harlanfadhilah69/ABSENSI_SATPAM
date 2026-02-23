const dbConfig = require("../config/db"); 

/**
 * 1. ADMIN UPDATE/EDIT TUGAS (TANPA RESET PROGRESS)
 * Logic: 
 * - Jika post_ids kosong -> Hapus semua misi hari ini.
 * - Jika post_ids ada isi -> Hanya tambah yang belum ada (Progress lama aman).
 */
const assignMission = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    const { user_id, post_ids } = req.body; 
    const today = new Date().toISOString().split('T')[0];

    if (!user_id) {
      return res.status(400).json({ message: "User ID wajib ada" });
    }

    // ✅ FITUR KOSONGKAN: Jika Admin mengirim array kosong, hapus semua misi hari ini
    if (post_ids && post_ids.length === 0) {
      await db.query(
        "DELETE FROM patrol_missions WHERE user_id = ? AND mission_date = ?",
        [user_id, today]
      );
      return res.json({ success: true, message: "Seluruh tugas hari ini berhasil dikosongkan! 🗑️" });
    }

    // ✅ FITUR EDIT/TAMBAH: Ambil misi yang SUDAH ADA hari ini
    const [existingMissions] = await db.query(
      "SELECT post_id FROM patrol_missions WHERE user_id = ? AND mission_date = ?",
      [user_id, today]
    );
    const existingIds = existingMissions.map(m => m.post_id);

    // Filter: Hanya masukkan ID yang benar-benar BARU
    const newPostIds = post_ids.filter(id => !existingIds.includes(id));

    if (newPostIds.length > 0) {
      const insertQueries = newPostIds.map(post_id => {
        return db.query(
          "INSERT INTO patrol_missions (user_id, post_id, mission_date, status) VALUES (?, ?, ?, 'pending')",
          [user_id, post_id, today]
        );
      });
      await Promise.all(insertQueries);
    }

    res.json({ 
      success: true, 
      message: newPostIds.length > 0 
        ? `Berhasil menambah ${newPostIds.length} tugas baru!` 
        : "Daftar tugas sudah sesuai." 
    });
  } catch (err) { 
    console.error("Error Assign/Edit Mission:", err);
    next(err); 
  }
};

/**
 * 2. AMBIL ID POS YANG SUDAH DITUGASKAN (UNTUK MODAL EDIT)
 */
const getAssignedPostIds = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const db = await dbConfig.getPool();
    const today = new Date().toISOString().split('T')[0];

    const [rows] = await db.query(
      "SELECT post_id FROM patrol_missions WHERE user_id = ? AND mission_date = ?",
      [userId, today]
    );

    const postIds = rows.map(r => r.post_id);
    res.json({ success: true, data: postIds });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil data tugas" });
  }
};

/**
 * 3. HAPUS SATU POS TERTENTU (Hanya jika belum 'completed')
 */
const deleteSingleMission = async (req, res, next) => {
  try {
    const { userId, postId } = req.params;
    const db = await dbConfig.getPool();
    const today = new Date().toISOString().split('T')[0];

    const [check] = await db.query(
      "SELECT status FROM patrol_missions WHERE user_id = ? AND post_id = ? AND mission_date = ?",
      [userId, postId, today]
    );

    if (check.length > 0 && check[0].status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: "Gagal! Pos ini sudah diselesaikan." 
      });
    }

    await db.query(
      "DELETE FROM patrol_missions WHERE user_id = ? AND post_id = ? AND mission_date = ?",
      [userId, postId, today]
    );

    res.json({ success: true, message: "Tugas berhasil ditarik! 🗑️" });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. MENGAMBIL DAFTAR MISI (Satpam)
 */
const getMyMissions = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    const userId = req.user.id; 
    const today = new Date().toISOString().split('T')[0];

    const [rows] = await db.query(
      `SELECT pm.*, p.post_name, p.location_desc 
       FROM patrol_missions pm
       JOIN posts p ON pm.post_id = p.id
       WHERE pm.user_id = ? AND pm.mission_date = ? AND p.is_active = 1
       ORDER BY (pm.status = 'completed') ASC, p.post_name ASC`, 
      [userId, today]
    );

    const total = rows.length;
    const completed = rows.filter(r => r.status === 'completed').length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return res.json({
      success: true,
      progress: progressPercent,
      total_pos: total,
      completed_pos: completed,
      data: rows 
    });
  } catch (err) { next(err); }
};

/**
 * 5. UPDATE STATUS MISI (Scan)
 */
const completeMission = async (userId, postId) => {
  try {
    const db = await dbConfig.getPool();
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db.query(
      `UPDATE patrol_missions SET status = 'completed', completed_at = NOW() 
       WHERE user_id = ? AND post_id = ? AND mission_date = ? AND status = 'pending'`,
      [userId, postId, today]
    );
    return result.affectedRows > 0;
  } catch (err) { return false; }
};

/**
 * 6. MONITORING DASHBOARD
 */
const getAllSatpamMissions = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    const [rows] = await db.query(`
      SELECT u.id, u.name,
      COALESCE((SELECT COUNT(*) FROM patrol_missions pm JOIN posts p ON pm.post_id = p.id WHERE pm.user_id = u.id AND pm.mission_date = CURDATE() AND p.is_active = 1), 0) as total_pos,
      COALESCE((SELECT COUNT(*) FROM patrol_missions pm JOIN posts p ON pm.post_id = p.id WHERE pm.user_id = u.id AND pm.mission_date = CURDATE() AND pm.status = 'completed' AND p.is_active = 1), 0) as completed_pos
      FROM users u WHERE u.role = 'satpam' AND u.is_active = 1
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
 * 7. DASHBOARD STATS
 */
const getDashboardData = async (req, res, next) => {
  try {
    const db = await dbConfig.getPool();
    const [stats] = await db.query(`SELECT COUNT(*) as todayCount FROM patrol_logs WHERE DATE(created_at) = CURDATE()`);
    const [recentActivities] = await db.query(`
      SELECT u.name as satpam_name, p.post_name, DATE_FORMAT(r.created_at, '%H:%i:%s') as created_at
      FROM patrol_logs r JOIN users u ON r.user_id = u.id JOIN posts p ON r.post_id = p.id
      WHERE DATE(r.created_at) = CURDATE() ORDER BY r.id DESC LIMIT 10
    `);
    const [alerts] = await db.query(`
      SELECT u.name as satpam_name, p.post_name
      FROM patrol_missions pm JOIN users u ON pm.user_id = u.id JOIN posts p ON pm.post_id = p.id
      WHERE pm.mission_date = CURDATE() AND pm.status = 'pending' AND p.is_active = 1
    `);
    res.json({ success: true, todayCount: stats[0].todayCount || 0, recentActivities, alerts });
  } catch (err) { next(err); }
};

/**
 * 8. DETAIL PROGRESS
 */
const getMissionDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const db = await dbConfig.getPool();
    const [rows] = await db.query(`
      SELECT pm.post_id, p.post_name, IF(pm.status = 'completed', 1, 0) as status, DATE_FORMAT(pm.completed_at, '%H:%i:%s') as check_time
      FROM patrol_missions pm JOIN posts p ON pm.post_id = p.id
      WHERE pm.user_id = ? AND pm.mission_date = CURDATE() AND p.is_active = 1
      ORDER BY status DESC, p.post_name ASC
    `, [userId]);
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, message: "Gagal ambil detail pos" }); }
};

module.exports = { assignMission, getAssignedPostIds, deleteSingleMission, getMyMissions, completeMission, getAllSatpamMissions, getDashboardData, getMissionDetail };