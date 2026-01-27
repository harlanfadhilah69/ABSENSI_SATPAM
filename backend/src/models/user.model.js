// src/models/user.model.js

class User {
  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.username = row.username;
    this.role = row.role; // admin | satpam
    this.is_active = Boolean(row.is_active);
    this.created_at = row.created_at;
    this.updated_at = row.updated_at;
  }
}

module.exports = User;
