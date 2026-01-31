// backend/src/controllers/satpam/patrolHistory.controller.js
const patrolLogsRepo = require("../../repositories/patrolLogs.repo");

exports.myLogs = async (req, res, next) => {
  try {
    const user = req.user; // dari auth middleware

    // ✅ ambil filter yang dipakai di frontend
    const { date_from, date_to, post_id, pos } = req.query;

    const logs = await patrolLogsRepo.list({
      dateFrom: date_from,
      dateTo: date_to,
      postId: post_id,   // optional (kalau suatu saat pakai dropdown ID)
      pos: pos,          // ✅ filter nama pos (dari input "Pos" di satpam)
      userId: user.id,   // ✅ hanya log satpam ini
    });

    res.json({ data: logs });
  } catch (err) {
    next(err);
  }
};
