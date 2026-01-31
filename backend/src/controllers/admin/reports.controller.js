// src/controllers/admin/reports.controller.js
const patrolLogsRepo = require("../../repositories/patrolLogs.repo");

// GET /admin/reports
exports.listLogs = async (req, res, next) => {
  try {
    const { date_from, date_to, post_id, user_id, satpam, pos } = req.query;

    const logs = await patrolLogsRepo.list({
      dateFrom: date_from,
      dateTo: date_to,
      postId: post_id,
      userId: user_id,
      satpam,
      pos,
    });

    return res.json({ data: logs });
  } catch (err) {
    next(err);
  }
};

// DELETE /admin/reports/:id
exports.deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    // removeById() -> affectedRows (angka)
    const affected = await patrolLogsRepo.removeById(id);

    if (!affected) {
      return res.status(404).json({ message: "Log patroli tidak ditemukan" });
    }

    return res.json({ message: "Log patroli berhasil dihapus ✅" });
  } catch (err) {
    next(err);
  }
};
