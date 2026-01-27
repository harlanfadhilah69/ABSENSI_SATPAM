// src/models/patrolLog.model.js

class PatrolLog {
  constructor(row) {
    this.id = row.id;
    this.user_id = row.user_id;
    this.post_id = row.post_id;
    this.photo_path = row.photo_path;
    this.note = row.note;
    this.device_info = row.device_info;
    this.captured_at_server = row.captured_at_server;
    this.created_at = row.created_at;
  }
}

module.exports = PatrolLog;
