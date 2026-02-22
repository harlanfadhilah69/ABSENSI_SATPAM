// src/models/post.model.js
class Post {
  constructor(row) {
    this.id = row.id;
    this.post_name = row.post_name;
    this.location_desc = row.location_desc;
    this.is_active = Boolean(row.is_active);
    
    // ✅ WAJIB TAMBAHKAN INI AGAR DATA LAT/LNG TIDAK HILANG
    this.lat = row.lat; 
    this.lng = row.lng;
    
    this.created_at = row.created_at;
    this.updated_at = row.updated_at;
  }
}
module.exports = Post;