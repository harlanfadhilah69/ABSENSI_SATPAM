export const ENDPOINTS = {
  LOGIN: "/auth/login",
  ME: "/auth/me",

  ADMIN_POSTS: "/admin/posts",
  ADMIN_POST_QR: (id) => `/admin/posts/${id}/qr`,
  ADMIN_USERS: "/admin/users",
  ADMIN_REPORTS: "/admin/reports/patrol-logs",

  PATROL_SCAN: (postId, token) => `/patrol/scan?post_id=${postId}&token=${token}`,
  PATROL_SUBMIT: "/patrol/submit",
  ADMIN_REPORTS: "/admin/reports/patrol-logs",

};
