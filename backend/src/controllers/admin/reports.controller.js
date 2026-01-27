// src/controllers/admin/reports.controller.js
const patrolLogsRepo = require("../../repositories/patrolLogs.repo");

exports.listLogs = async (req, res, next) => {
  try {
    const { date_from, date_to, post_id, user_id } = req.query;
    const logs = await patrolLogsRepo.list({
      dateFrom: date_from,
      dateTo: date_to,
      postId: post_id,
      userId: user_id,
    });
    res.json({ data: logs });
  } catch (err) {
    next(err);
  }
};
