// src/services/report.service.js
const patrolLogsRepo = require("../repositories/patrolLogs.repo");

exports.getPatrolLogs = async (filters) => {
  return patrolLogsRepo.list(filters);
};
